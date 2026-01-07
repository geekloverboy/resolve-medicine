import { ResolvedMedicine } from '@/types/medicine';
import { Check, AlertTriangle, X, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MedicineResultsProps {
  medicines: ResolvedMedicine[];
  isLoading: boolean;
}

function ConfidenceBar({ confidence }: { confidence: number }) {
  const percentage = Math.round(confidence * 100);
  
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn(
            'h-full rounded-full transition-all duration-500',
            confidence >= 0.7 && 'bg-confidence-high',
            confidence >= 0.4 && confidence < 0.7 && 'bg-confidence-medium',
            confidence < 0.4 && 'bg-confidence-low',
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground tabular-nums">{percentage}%</span>
    </div>
  );
}

function StatusIcon({ status }: { status: ResolvedMedicine['status'] }) {
  switch (status) {
    case 'accepted':
      return (
        <div className="w-6 h-6 rounded-full bg-confidence-high/15 flex items-center justify-center">
          <Check className="w-3.5 h-3.5 text-confidence-high" />
        </div>
      );
    case 'verify':
      return (
        <div className="w-6 h-6 rounded-full bg-confidence-medium/15 flex items-center justify-center">
          <AlertTriangle className="w-3.5 h-3.5 text-confidence-medium" />
        </div>
      );
    case 'excluded':
      return (
        <div className="w-6 h-6 rounded-full bg-confidence-low/15 flex items-center justify-center">
          <X className="w-3.5 h-3.5 text-confidence-low" />
        </div>
      );
  }
}

export function MedicineResults({ medicines, isLoading }: MedicineResultsProps) {
  if (medicines.length === 0 && !isLoading) return null;

  const accepted = medicines.filter(m => m.status === 'accepted' || m.status === 'verify');
  const excluded = medicines.filter(m => m.status === 'excluded');

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 animate-fade-in">
      {/* Accepted medicines */}
      {accepted.length > 0 && (
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
            <Check className="w-4 h-4 text-confidence-high" />
            Recognized Medicines ({accepted.length})
          </h3>
          <div className="space-y-3">
            {accepted.map((med, i) => (
              <div 
                key={i}
                className={cn(
                  'flex items-center justify-between p-3 rounded-xl transition-colors',
                  med.status === 'verify' ? 'bg-confidence-medium/5' : 'bg-confidence-high/5'
                )}
              >
                <div className="flex items-center gap-3">
                  <StatusIcon status={med.status} />
                  <div>
                    <p className="font-medium text-foreground capitalize">{med.normalizedName}</p>
                    {med.originalInput.toLowerCase() !== med.normalizedName.toLowerCase() && (
                      <p className="text-xs text-muted-foreground">
                        from "{med.originalInput}"
                      </p>
                    )}
                    {med.status === 'verify' && med.message && (
                      <p className="text-xs text-confidence-medium mt-1 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        {med.message}
                      </p>
                    )}
                  </div>
                </div>
                <ConfidenceBar confidence={med.confidence} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Excluded medicines */}
      {excluded.length > 0 && (
        <div className="glass-card rounded-2xl p-5 bg-destructive/5 border-destructive/10">
          <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
            <X className="w-4 h-4 text-confidence-low" />
            Could Not Recognize ({excluded.length})
          </h3>
          <div className="space-y-2">
            {excluded.map((med, i) => (
              <div 
                key={i}
                className="flex items-center justify-between p-3 rounded-xl bg-background/50"
              >
                <div className="flex items-center gap-3">
                  <StatusIcon status={med.status} />
                  <div>
                    <p className="font-medium text-foreground">"{med.originalInput}"</p>
                    {med.message && (
                      <p className="text-xs text-muted-foreground mt-0.5">{med.message}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            These entries could not be matched to known medicine names. Please check spelling or try alternative names.
          </p>
        </div>
      )}
    </div>
  );
}
