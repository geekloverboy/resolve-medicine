import { useState, useCallback } from 'react';
import { ResolvedMedicine, AIResolvedMedicine } from '@/types/medicine';
import { computeOrganBurdens, OrganBurden } from '@/lib/burdenEngine';

// Parse user input into individual medicine names
function parseMedicineInput(input: string): string[] {
  // Split on commas, "+", and "and"
  const parts = input
    .split(/[,+]|\band\b/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  
  // Deduplicate (case-insensitive)
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const part of parts) {
    const lower = part.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      unique.push(part);
    }
  }
  
  return unique;
}

// Determine medicine status based on confidence
function getMedicineStatus(confidence: number, canonicalId: string): ResolvedMedicine['status'] {
  if (canonicalId === 'unknown' || confidence < 0.4) {
    return 'excluded';
  }
  if (confidence >= 0.7) {
    return 'accepted';
  }
  return 'verify';
}

// Get status message based on confidence
function getStatusMessage(confidence: number, canonicalId: string): string | undefined {
  if (canonicalId === 'unknown') {
    return 'Could not identify this medicine';
  }
  if (confidence < 0.4) {
    return 'Confidence too low to include';
  }
  if (confidence < 0.7) {
    return 'Please verify this interpretation is correct';
  }
  return undefined;
}

export function useMedicineAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [medicines, setMedicines] = useState<ResolvedMedicine[]>([]);
  const [organBurdens, setOrganBurdens] = useState<OrganBurden[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const analyzeMedicines = useCallback(async (input: string) => {
    setIsLoading(true);
    setError(null);
    setMedicines([]);
    setOrganBurdens([]);
    setHasAnalyzed(false);

    const medicineNames = parseMedicineInput(input);
    
    if (medicineNames.length === 0) {
      setError('Please enter at least one medicine name');
      setIsLoading(false);
      return;
    }

    const results: ResolvedMedicine[] = [];

    // Process each medicine sequentially to avoid rate limiting
    for (const name of medicineNames) {
      try {
        const response = await fetch('/api/resolve-medicine', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ medicineName: name }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          console.error('Error resolving:', name, errorData);
          results.push({
            originalInput: name,
            canonicalId: 'unknown',
            normalizedName: name,
            confidence: 0,
            status: 'excluded',
            message: errorData.error || 'Failed to resolve medicine name',
          });
          continue;
        }

        const resolved = (await response.json()) as AIResolvedMedicine;
        const status = getMedicineStatus(resolved.confidence, resolved.canonical_id);
        
        results.push({
          originalInput: name,
          canonicalId: resolved.canonical_id,
          normalizedName: resolved.normalized_name,
          confidence: resolved.confidence,
          status,
          message: getStatusMessage(resolved.confidence, resolved.canonical_id),
        });
      } catch (err) {
        console.error('Error processing medicine:', name, err);
        results.push({
          originalInput: name,
          canonicalId: 'unknown',
          normalizedName: name,
          confidence: 0,
          status: 'excluded',
          message: 'An error occurred while processing',
        });
      }
    }

    setMedicines(results);
    
    // Compute organ burdens for accepted medicines
    const acceptedIds = results
      .filter((m) => m.status === 'accepted' || m.status === 'verify')
      .map((m) => m.canonicalId);
    
    const burdens = computeOrganBurdens(acceptedIds);
    setOrganBurdens(burdens);
    setHasAnalyzed(true);
    setIsLoading(false);
  }, []);

  const reset = useCallback(() => {
    setMedicines([]);
    setOrganBurdens([]);
    setError(null);
    setHasAnalyzed(false);
  }, []);

  return {
    isLoading,
    medicines,
    organBurdens,
    error,
    hasAnalyzed,
    analyzeMedicines,
    reset,
    acceptedCount: medicines.filter((m) => m.status !== 'excluded').length,
    excludedCount: medicines.filter((m) => m.status === 'excluded').length,
  };
}
