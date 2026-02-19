import type { AnalysisResult } from "@/lib/analyzeImage";
import type { Easing } from "framer-motion";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle, Activity, Stethoscope, ListChecks, GitBranch } from "lucide-react";

interface AnalysisDisplayProps {
  analysis: AnalysisResult;
  fileName: string;
}

const easeOut: Easing = [0.0, 0.0, 0.2, 1.0];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: easeOut } },
};

export function AnalysisDisplay({ analysis, fileName }: AnalysisDisplayProps) {
  const diagIcon =
    analysis.diagnosis === "Positive" ? <XCircle className="h-7 w-7 text-destructive" /> :
    analysis.diagnosis === "Negative" ? <CheckCircle className="h-7 w-7 text-medical-success" /> :
    <AlertTriangle className="h-7 w-7 text-medical-warning" />;

  const diagBg =
    analysis.diagnosis === "Positive" ? "bg-destructive/8 border-destructive/15" :
    analysis.diagnosis === "Negative" ? "bg-medical-success/8 border-medical-success/15" :
    "bg-medical-warning/8 border-medical-warning/15";

  const diagAccent =
    analysis.diagnosis === "Positive" ? "text-destructive" :
    analysis.diagnosis === "Negative" ? "text-medical-success" :
    "text-medical-warning";

  const indicators = [
    { label: "Bird's Beak Sign", value: analysis.key_indicators.bird_beak_sign },
    { label: "Dilated Esophagus", value: analysis.key_indicators.dilated_esophagus },
    { label: "Absent Peristalsis", value: analysis.key_indicators.absent_peristalsis },
    { label: "Food Retention", value: analysis.key_indicators.food_retention },
    { label: "Narrowed LES", value: analysis.key_indicators.narrowed_les },
    { label: "Sigmoid Esophagus", value: analysis.key_indicators.sigmoid_esophagus },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      {/* Diagnosis Header */}
      <motion.div variants={item} className={`rounded-xl border p-6 ${diagBg}`}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-0.5">{diagIcon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-lg font-bold text-foreground tracking-tight">
                Achalasia Cardia — {analysis.diagnosis}
              </h3>
            </div>
            <div className="flex items-center gap-6 mt-2">
              <div>
                <span className={`text-2xl font-mono font-bold ${diagAccent}`}>
                  {analysis.confidence}%
                </span>
                <span className="text-xs text-muted-foreground ml-1">confidence</span>
              </div>
              <div>
                <span className="text-2xl font-mono font-bold text-primary">
                  {analysis.accuracy_score ?? "N/A"}%
                </span>
                <span className="text-xs text-muted-foreground ml-1">accuracy</span>
              </div>
            </div>
            {analysis.achalasia_type && analysis.achalasia_type !== "Not Applicable" && (
              <p className="text-sm text-muted-foreground mt-2 font-medium">{analysis.achalasia_type}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Key Indicators */}
      <motion.div variants={item} className="rounded-xl border border-border bg-card p-5 medical-card-shadow">
        <h4 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" /> Key Indicators
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {indicators.map((ind, i) => (
            <motion.div
              key={ind.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors
                ${ind.value ? "bg-medical-success/10 text-medical-success" : "bg-muted text-muted-foreground"}`}
            >
              {ind.value ? <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" /> : <XCircle className="h-3.5 w-3.5 flex-shrink-0" />}
              {ind.label}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Findings */}
      {analysis.findings?.length > 0 && (
        <motion.div variants={item} className="rounded-xl border border-border bg-card p-5 medical-card-shadow">
          <h4 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-primary" /> Detailed Findings
          </h4>
          <div className="space-y-2">
            {analysis.findings.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.06 }}
                className="flex items-start gap-3 rounded-lg bg-muted/50 p-3.5 hover:bg-muted/80 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-relaxed">{f.finding}</p>
                  <p className="text-xs text-muted-foreground mt-1">{f.location}</p>
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap
                  ${f.severity === "Severe" ? "bg-destructive/10 text-destructive" :
                    f.severity === "Moderate" ? "bg-medical-warning/10 text-medical-warning" :
                    f.severity === "Mild" ? "bg-primary/10 text-primary" :
                    "bg-medical-success/10 text-medical-success"}`}>
                  {f.severity}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Clinical Notes */}
      {analysis.clinical_notes && (
        <motion.div variants={item} className="rounded-xl border-2 border-primary/20 bg-primary/5 p-5 medical-card-shadow relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-primary rounded-l-xl" />
          <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2 pl-3">
            <Stethoscope className="h-4 w-4 text-primary" /> Clinical Interpretation
          </h4>
          <p className="text-sm text-foreground font-medium leading-relaxed pl-3">{analysis.clinical_notes}</p>
        </motion.div>
      )}

      {/* Recommendations */}
      {analysis.recommendations?.length > 0 && (
        <motion.div variants={item} className="rounded-xl border border-border bg-card p-5 medical-card-shadow">
          <h4 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-primary" /> Recommendations
          </h4>
          <ol className="space-y-3">
            {analysis.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                  {i + 1}
                </span>
                <span className="text-muted-foreground leading-relaxed pt-0.5">{rec}</span>
              </li>
            ))}
          </ol>
        </motion.div>
      )}

    </motion.div>
  );
}
