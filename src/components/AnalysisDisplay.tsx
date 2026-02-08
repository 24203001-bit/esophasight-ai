import type { AnalysisResult } from "@/lib/analyzeImage";
import { CheckCircle, XCircle, AlertTriangle, Activity, Stethoscope } from "lucide-react";

interface AnalysisDisplayProps {
  analysis: AnalysisResult;
  fileName: string;
}

export function AnalysisDisplay({ analysis, fileName }: AnalysisDisplayProps) {
  const diagIcon =
    analysis.diagnosis === "Positive" ? <XCircle className="h-6 w-6 text-destructive" /> :
    analysis.diagnosis === "Negative" ? <CheckCircle className="h-6 w-6 text-medical-success" /> :
    <AlertTriangle className="h-6 w-6 text-medical-warning" />;

  const diagBg =
    analysis.diagnosis === "Positive" ? "bg-destructive/10 border-destructive/20" :
    analysis.diagnosis === "Negative" ? "bg-medical-success/10 border-medical-success/20" :
    "bg-medical-warning/10 border-medical-warning/20";

  const indicators = [
    { label: "Bird's Beak Sign", value: analysis.key_indicators.bird_beak_sign },
    { label: "Dilated Esophagus", value: analysis.key_indicators.dilated_esophagus },
    { label: "Absent Peristalsis", value: analysis.key_indicators.absent_peristalsis },
    { label: "Food Retention", value: analysis.key_indicators.food_retention },
    { label: "Narrowed LES", value: analysis.key_indicators.narrowed_les },
    { label: "Sigmoid Esophagus", value: analysis.key_indicators.sigmoid_esophagus },
  ];

  return (
    <div className="space-y-4">
      {/* Diagnosis Header */}
      <div className={`rounded-lg border p-5 ${diagBg}`}>
        <div className="flex items-start gap-4">
          {diagIcon}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-lg font-semibold text-foreground">
                Achalasia Cardia — {analysis.diagnosis}
              </h3>
              <span className="text-sm font-mono font-medium px-2 py-0.5 rounded bg-foreground/10">
                {analysis.confidence}% confidence
              </span>
            </div>
            {analysis.achalasia_type && analysis.achalasia_type !== "Not Applicable" && (
              <p className="text-sm text-muted-foreground mt-1">{analysis.achalasia_type}</p>
            )}
          </div>
        </div>
      </div>

      {/* Key Indicators */}
      <div className="rounded-lg border border-border bg-card p-4 medical-card-shadow">
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" /> Key Indicators
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {indicators.map((ind) => (
            <div
              key={ind.label}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium
                ${ind.value ? "bg-medical-success/10 text-medical-success" : "bg-muted text-muted-foreground"}`}
            >
              {ind.value ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
              {ind.label}
            </div>
          ))}
        </div>
      </div>

      {/* Findings */}
      {analysis.findings?.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4 medical-card-shadow">
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-primary" /> Detailed Findings
          </h4>
          <div className="space-y-2">
            {analysis.findings.map((f, i) => (
              <div key={i} className="flex items-start gap-3 rounded-md bg-medical-surface p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{f.finding}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{f.location}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded whitespace-nowrap
                  ${f.severity === "Severe" ? "bg-destructive/10 text-destructive" :
                    f.severity === "Moderate" ? "bg-medical-warning/10 text-medical-warning" :
                    f.severity === "Mild" ? "bg-primary/10 text-primary" :
                    "bg-medical-success/10 text-medical-success"}`}>
                  {f.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clinical Notes */}
      {analysis.clinical_notes && (
        <div className="rounded-lg border border-border bg-card p-4 medical-card-shadow">
          <h4 className="text-sm font-semibold text-foreground mb-2">Clinical Interpretation</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{analysis.clinical_notes}</p>
        </div>
      )}

      {/* Recommendations */}
      {analysis.recommendations?.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4 medical-card-shadow">
          <h4 className="text-sm font-semibold text-foreground mb-3">Recommendations</h4>
          <ol className="space-y-2">
            {analysis.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="flex-shrink-0 w-5 h-5 rounded bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">{rec}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Differential Diagnoses */}
      {analysis.differential_diagnoses?.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4 medical-card-shadow">
          <h4 className="text-sm font-semibold text-foreground mb-2">Differential Diagnoses</h4>
          <div className="flex flex-wrap gap-2">
            {analysis.differential_diagnoses.map((dd, i) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                {dd}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
