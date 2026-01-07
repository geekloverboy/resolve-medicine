import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Understanding medicine names…' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        <div className="absolute inset-0 rounded-full bg-primary/5 animate-ping" />
      </div>
      <p className="mt-6 text-lg font-medium text-foreground">{message}</p>
      <p className="mt-2 text-sm text-muted-foreground">This may take a few seconds</p>
    </div>
  );
}
