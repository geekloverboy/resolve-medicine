import { Info } from 'lucide-react';

export function DisclaimerBanner() {
  return (
    <div className="disclaimer-banner flex items-start gap-3 animate-fade-in">
      <Info className="w-4 h-4 mt-0.5 shrink-0" />
      <div>
        <p className="font-medium">For educational purposes only. Not for clinical use.</p>
        <p className="text-xs opacity-80 mt-1">
          This tool provides illustrative information about how medicines may affect different organs. 
          Always consult healthcare professionals for medical advice.
        </p>
      </div>
    </div>
  );
}
