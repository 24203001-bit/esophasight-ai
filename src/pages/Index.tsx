import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageUpload } from "@/components/ImageUpload";
import { AnalysisDisplay } from "@/components/AnalysisDisplay";
import { analyzeImage, type AnalysisResult } from "@/lib/analyzeImage";
import { generateReport } from "@/lib/generateReport";
import { Button } from "@/components/ui/button";
import { Loader2, FileDown, Scan, Microscope, Zap } from "lucide-react";
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
      <header className="medical-gradient relative overflow-hidden">
        {/* Subtle dot pattern overlay */}
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="relative w-full py-10 px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="h-12 w-12 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/10 flex items-center justify-center">
                <Microscope className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary-foreground tracking-tight">
                  Achalasia Cardia Diagnostic AI
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-medical-success animate-pulse" />
                  <p className="text-xs text-primary-foreground/60 font-medium">
                    AI-Powered • GI Tract Specialized Analysis
                  </p>
                </div>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/50 mt-4 max-w-xl leading-relaxed">
              Upload esophageal imaging studies for AI-assisted detection of Achalasia Cardia,
              including barium swallow, CT, endoscopy, and manometry images.
            </p>
          </motion.div>
        </div>
      </header>

      <main className="w-full px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel - Upload */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-1 space-y-5"
          >
            <div className="rounded-xl border border-border bg-card p-5 medical-card-shadow">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Scan className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-sm font-bold text-foreground">Medical Image Input</h2>
              </div>

              <ImageUpload
                onFileSelect={setSelectedFile}
                isAnalyzing={isAnalyzing}
                selectedFile={selectedFile}
                onClear={handleClear}
              />

              <div className="mt-5 space-y-2.5">
                <Button
                  onClick={handleAnalyze}
                  disabled={!selectedFile || isAnalyzing}
                  className="w-full h-12 text-sm font-semibold rounded-xl glow-primary"
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Analyze for Achalasia
                    </>
                  )}
                </Button>

                <AnimatePresence>
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Button
                        onClick={handleDownloadReport}
                        variant="outline"
                        className="w-full h-12 text-sm font-semibold rounded-xl"
                        size="lg"
                      >
                        <FileDown className="h-4 w-4 mr-2" />
                        Download PDF Report
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Right Panel - Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <AnalysisDisplay analysis={result.analysis} fileName={result.fileName} />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl border border-dashed border-border bg-muted/30 p-16 text-center"
                >
                  <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                    <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
                      <Scan className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                  </motion.div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Upload an image and run analysis
                  </p>
                  <p className="text-xs text-muted-foreground/50 mt-1.5">
                    Diagnostic results will appear here
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Index;
