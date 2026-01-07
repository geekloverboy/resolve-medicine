// Type definitions for Medicine Burden Visualizer

export interface AIResolvedMedicine {
  canonical_id: string;
  normalized_name: string;
  confidence: number;
}

export interface ResolvedMedicine {
  originalInput: string;
  canonicalId: string;
  normalizedName: string;
  confidence: number;
  status: 'accepted' | 'verify' | 'excluded';
  message?: string;
}

export interface MedicineInput {
  raw: string;
  parsed: string[];
}

export interface AnalysisResult {
  medicines: ResolvedMedicine[];
  acceptedMedicines: ResolvedMedicine[];
  excludedMedicines: ResolvedMedicine[];
  isLoading: boolean;
  error?: string;
}
