import { useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { AnalysisDisplay } from "@/components/AnalysisDisplay";
import { analyzeImage, type AnalysisResult } from "@/lib/analyzeImage";
import { generateReport } from "@/lib/generateReport";
import { Button } from "@/components/ui/button";
import { Loader2, FileDown, Scan, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{ analysis: AnalysisResult; fileName: string } | null>(null);

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setResult(null);
    try {
      const data = await analyzeImage(selectedFile);
      setResult(data);
      toast.success("Analysis complete");
    } catch (e: any) {
      toast.error(e.message || "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadReport = () => {
    if (!result) return;
    generateReport(result.analysis, result.fileName);
    toast.success("Report downloaded");
  };

  const handleClear = () => {
    setSelectedFile(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="medical-gradient">
        <div className="container max-w-5xl py-8 px-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Scan className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary-foreground tracking-tight">
                Achalasia Cardia Diagnostic AI
              </h1>
              <p className="text-xs text-primary-foreground/70">
                Gemini 2.5 Pro Vision • GI Tract Specialized Analysis
              </p>
            </div>
          </div>
          <p className="text-sm text-primary-foreground/60 mt-3 max-w-xl">
            Upload esophageal imaging studies for AI-assisted detection of Achalasia Cardia,
            including barium swallow, CT, endoscopy, and manometry images.
          </p>
        </div>
      </header>

      <main className="container max-w-5xl px-4 py-8">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left Panel - Upload */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-lg border border-border bg-card p-4 medical-card-shadow">
              <h2 className="text-sm font-semibold text-foreground mb-3">Medical Image Input</h2>
              <ImageUpload
                onFileSelect={setSelectedFile}
                isAnalyzing={isAnalyzing}
                selectedFile={selectedFile}
                onClear={handleClear}
              />

              <div className="mt-4 space-y-2">
                <Button
                  onClick={handleAnalyze}
                  disabled={!selectedFile || isAnalyzing}
                  className="w-full"
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Scan className="h-4 w-4 mr-2" />
                      Analyze for Achalasia
                    </>
                  )}
                </Button>

                {result && (
                  <Button
                    onClick={handleDownloadReport}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    Download PDF Report
                  </Button>
                )}
              </div>
            </div>

            {/* Info card */}
            <div className="rounded-lg border border-border bg-card p-4 medical-card-shadow">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-medical-success flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-semibold text-foreground">Analysis Method</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Uses Gemini 2.5 Pro Vision with specialized GI tract prompting based on
                    Chicago Classification v4.0 criteria. Evaluates bird's beak sign, esophageal
                    dilation, peristalsis patterns, and LES function.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    For clinical reference only. Not a substitute for professional medical diagnosis.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-3">
            {result ? (
              <AnalysisDisplay analysis={result.analysis} fileName={result.fileName} />
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-medical-surface/50 p-12 text-center">
                <Scan className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  Upload an image and run analysis to see diagnostic results here
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Supported: Barium swallow, X-ray, CT, endoscopy, manometry
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
