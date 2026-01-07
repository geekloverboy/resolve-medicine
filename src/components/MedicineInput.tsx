import { useState, KeyboardEvent } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MedicineInputProps {
  onSubmit: (input: string) => void;
  isLoading: boolean;
}

export function MedicineInput({ onSubmit, isLoading }: MedicineInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    if (input.trim() && !isLoading) {
      onSubmit(input.trim());
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      <label htmlFor="medicine-input" className="block text-sm font-medium text-muted-foreground mb-3">
        Enter medicine names (separate multiple with commas or "and")
      </label>
      <div className="relative">
        <input
          id="medicine-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., paracetamol, ibuprofen and aspirin"
          className="input-medical pr-32"
          disabled={isLoading}
          aria-describedby="input-help"
        />
        <Button
          onClick={handleSubmit}
          disabled={!input.trim() || isLoading}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-6 h-12 rounded-xl font-medium"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Analyze
            </>
          )}
        </Button>
      </div>
      <p id="input-help" className="mt-3 text-sm text-muted-foreground/70">
        Example: "metformin, atorvastatin + lisinopril"
      </p>
    </div>
  );
}
