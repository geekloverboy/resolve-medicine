import { Pill, Activity, RotateCcw } from 'lucide-react';
import { MedicineInput } from '@/components/MedicineInput';
import { OrganVisualizer } from '@/components/OrganVisualizer';
import { MedicineResults } from '@/components/MedicineResults';
import { LoadingState } from '@/components/LoadingState';
import { DisclaimerBanner } from '@/components/DisclaimerBanner';
import { useMedicineAnalysis } from '@/hooks/useMedicineAnalysis';
import { Button } from '@/components/ui/button';

const Index = () => {
  const {
    isLoading,
    medicines,
    organBurdens,
    error,
    hasAnalyzed,
    analyzeMedicines,
    reset,
    acceptedCount,
  } = useMedicineAnalysis();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Pill className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Medicine Burden Visualizer</h1>
                <p className="text-xs text-muted-foreground">Educational Organ Impact Tool</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Educational Tool</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Disclaimer */}
        <div className="max-w-2xl mx-auto mb-8">
          <DisclaimerBanner />
        </div>

        {/* Hero Section */}
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Understand How Medicines
            <br />
            <span className="text-primary">Affect Your Organs</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Enter your medicines to see an educational visualization of how they 
            collectively impact different organs in your body.
          </p>
        </div>

        {/* Input Section */}
        <MedicineInput onSubmit={analyzeMedicines} isLoading={isLoading} />

        {/* Error display */}
        {error && (
          <div className="max-w-2xl mx-auto mt-6">
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-center">
              <p className="text-destructive font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mt-12">
            <LoadingState />
          </div>
        )}

        {/* Results Section */}
        {!isLoading && hasAnalyzed && (
          <div className="mt-12 space-y-12">
            {/* Medicine Results */}
            <MedicineResults medicines={medicines} isLoading={isLoading} />

            {/* Organ Visualization */}
            {acceptedCount > 0 && (
              <section className="animate-slide-up">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-semibold text-foreground mb-2">
                    Organ Burden Visualization
                  </h3>
                  <p className="text-muted-foreground">
                    Based on {acceptedCount} recognized medicine{acceptedCount !== 1 ? 's' : ''}
                  </p>
                </div>
                <OrganVisualizer burdens={organBurdens} />
              </section>
            )}

            {/* Reset Button */}
            <div className="flex justify-center">
              <Button variant="outline" onClick={reset} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Start New Analysis
              </Button>
            </div>
          </div>
        )}

        {/* Empty state / Getting started */}
        {!isLoading && !hasAnalyzed && (
          <div className="mt-16 text-center">
            <div className="glass-card rounded-3xl p-8 md:p-12 max-w-xl mx-auto animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Pill className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                How It Works
              </h3>
              <ol className="text-left text-muted-foreground space-y-3 mb-6">
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center shrink-0">1</span>
                  <span>Enter one or more medicine names (brand or generic)</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center shrink-0">2</span>
                  <span>Our AI identifies and normalizes medicine names</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center shrink-0">3</span>
                  <span>See which organs are commonly affected by your medicines</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center shrink-0">4</span>
                  <span>Click on organs for detailed educational information</span>
                </li>
              </ol>
              <p className="text-sm text-muted-foreground/70">
                Try: "paracetamol, metformin and atorvastatin"
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2024 Medicine Burden Visualizer. For educational purposes only.</p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              AI-Powered Medicine Recognition
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
