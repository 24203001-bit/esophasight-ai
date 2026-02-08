import jsPDF from "jspdf";
import type { AnalysisResult } from "./analyzeImage";

export function generateReport(
  analysis: AnalysisResult,
  fileName: string,
  imageDataUrl?: string
) {
  const pdf = new jsPDF("p", "mm", "a4");
  const W = 210;
  const margin = 18;
  const contentW = W - margin * 2;
  let y = 0;

  const colors = {
    navy: [15, 23, 42] as [number, number, number],
    blue: [37, 99, 235] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
    lightGray: [241, 245, 249] as [number, number, number],
    text: [30, 41, 59] as [number, number, number],
    mutedText: [100, 116, 139] as [number, number, number],
    success: [22, 163, 74] as [number, number, number],
    warning: [234, 179, 8] as [number, number, number],
    danger: [220, 38, 38] as [number, number, number],
    border: [203, 213, 225] as [number, number, number],
  };

  const addNewPageIfNeeded = (requiredSpace: number) => {
    if (y + requiredSpace > 270) {
      pdf.addPage();
      y = 20;
    }
  };

  // ── Header ──
  pdf.setFillColor(...colors.navy);
  pdf.rect(0, 0, W, 42, "F");

  pdf.setFillColor(...colors.blue);
  pdf.rect(0, 42, W, 3, "F");

  pdf.setTextColor(...colors.white);
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  pdf.text("ACHALASIA CARDIA", margin, 18);
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  pdf.text("AI-Assisted Diagnostic Report", margin, 26);

  pdf.setFontSize(8);
  pdf.text(`Report ID: ACH-${Date.now().toString(36).toUpperCase()}`, W - margin, 14, { align: "right" });
  pdf.text(`Date: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, W - margin, 20, { align: "right" });
  pdf.text(`Time: ${new Date().toLocaleTimeString("en-US")}`, W - margin, 26, { align: "right" });

  y = 52;

  // ── Input File ──
  pdf.setFillColor(...colors.lightGray);
  pdf.roundedRect(margin, y, contentW, 12, 2, 2, "F");
  pdf.setTextColor(...colors.mutedText);
  pdf.setFontSize(8);
  pdf.text("INPUT FILE:", margin + 4, y + 5);
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.text(fileName, margin + 30, y + 5);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(...colors.mutedText);
  pdf.text(`Image Type: ${analysis.image_type_detected || "N/A"}`, margin + 4, y + 10);
  pdf.text(`Image Quality: ${analysis.image_quality || "N/A"}`, margin + 80, y + 10);
  y += 18;

  // ── Diagnosis Summary ──
  const diagColor = analysis.diagnosis === "Positive" ? colors.danger : analysis.diagnosis === "Negative" ? colors.success : colors.warning;
  
  pdf.setDrawColor(...colors.border);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(margin, y, contentW, 28, 2, 2, "S");

  pdf.setFillColor(...diagColor);
  pdf.roundedRect(margin + 2, y + 2, 4, 24, 1, 1, "F");

  pdf.setTextColor(...colors.mutedText);
  pdf.setFontSize(7);
  pdf.text("PRIMARY DIAGNOSIS", margin + 10, y + 7);
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text(`Achalasia Cardia — ${analysis.diagnosis}`, margin + 10, y + 16);
  pdf.setFont("helvetica", "normal");

  pdf.setTextColor(...colors.mutedText);
  pdf.setFontSize(7);
  pdf.text("CONFIDENCE", W - margin - 35, y + 7);
  pdf.setTextColor(...diagColor);
  pdf.setFontSize(22);
  pdf.setFont("helvetica", "bold");
  pdf.text(`${analysis.confidence}%`, W - margin - 35, y + 20);
  pdf.setFont("helvetica", "normal");

  if (analysis.achalasia_type && analysis.achalasia_type !== "Not Applicable") {
    pdf.setTextColor(...colors.mutedText);
    pdf.setFontSize(8);
    pdf.text(`Classification: ${analysis.achalasia_type}`, margin + 10, y + 25);
  }

  y += 34;

  // ── Key Indicators ──
  addNewPageIfNeeded(30);
  pdf.setTextColor(...colors.navy);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text("KEY INDICATORS", margin, y + 4);
  pdf.setFont("helvetica", "normal");
  y += 8;

  const indicators = [
    { label: "Bird's Beak Sign", value: analysis.key_indicators.bird_beak_sign },
    { label: "Dilated Esophagus", value: analysis.key_indicators.dilated_esophagus },
    { label: "Absent Peristalsis", value: analysis.key_indicators.absent_peristalsis },
    { label: "Food Retention", value: analysis.key_indicators.food_retention },
    { label: "Narrowed LES", value: analysis.key_indicators.narrowed_les },
    { label: "Sigmoid Esophagus", value: analysis.key_indicators.sigmoid_esophagus },
  ];

  const colW = contentW / 3;
  indicators.forEach((ind, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = margin + col * colW;
    const iy = y + row * 10;

    const detected = ind.value === true;
    pdf.setFillColor(detected ? 254 : 241, detected ? 242 : 245, detected ? 242 : 249);
    pdf.roundedRect(x, iy, colW - 3, 8, 1, 1, "F");

    pdf.setTextColor(detected ? 22 : 100, detected ? 163 : 116, detected ? 74 : 139);
    pdf.setFontSize(7);
    pdf.text(detected ? "✓" : "✗", x + 3, iy + 5.5);
    pdf.setTextColor(...colors.text);
    pdf.setFontSize(7.5);
    pdf.text(ind.label, x + 8, iy + 5.5);
  });

  y += Math.ceil(indicators.length / 3) * 10 + 6;

  // ── Findings ──
  if (analysis.findings && analysis.findings.length > 0) {
    addNewPageIfNeeded(20);
    pdf.setTextColor(...colors.navy);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text("DETAILED FINDINGS", margin, y + 4);
    pdf.setFont("helvetica", "normal");
    y += 8;

    // Table header
    pdf.setFillColor(...colors.navy);
    pdf.roundedRect(margin, y, contentW, 7, 1, 1, "F");
    pdf.setTextColor(...colors.white);
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "bold");
    pdf.text("Finding", margin + 3, y + 5);
    pdf.text("Severity", margin + 100, y + 5);
    pdf.text("Location", margin + 130, y + 5);
    pdf.setFont("helvetica", "normal");
    y += 8;

    analysis.findings.forEach((f, i) => {
      addNewPageIfNeeded(10);
      if (i % 2 === 0) {
        pdf.setFillColor(...colors.lightGray);
        pdf.rect(margin, y - 1, contentW, 8, "F");
      }

      pdf.setTextColor(...colors.text);
      pdf.setFontSize(7);
      const findingLines = pdf.splitTextToSize(f.finding, 93);
      pdf.text(findingLines[0], margin + 3, y + 4);

      const sevColor = f.severity === "Severe" ? colors.danger : f.severity === "Moderate" ? colors.warning : f.severity === "Mild" ? colors.blue : colors.success;
      pdf.setTextColor(...sevColor);
      pdf.text(f.severity, margin + 100, y + 4);

      pdf.setTextColor(...colors.mutedText);
      const locLines = pdf.splitTextToSize(f.location, 40);
      pdf.text(locLines[0], margin + 130, y + 4);
      y += 8;
    });
    y += 4;
  }

  // ── Clinical Notes ──
  if (analysis.clinical_notes) {
    addNewPageIfNeeded(25);
    pdf.setTextColor(...colors.navy);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text("CLINICAL INTERPRETATION", margin, y + 4);
    pdf.setFont("helvetica", "normal");
    y += 8;

    pdf.setDrawColor(...colors.border);
    pdf.setLineWidth(0.3);
    const noteLines = pdf.splitTextToSize(analysis.clinical_notes, contentW - 8);
    const noteHeight = noteLines.length * 4 + 6;
    addNewPageIfNeeded(noteHeight);
    pdf.roundedRect(margin, y, contentW, noteHeight, 2, 2, "S");
    pdf.setTextColor(...colors.text);
    pdf.setFontSize(7.5);
    pdf.text(noteLines, margin + 4, y + 5);
    y += noteHeight + 6;
  }

  // ── Differential Diagnoses ──
  if (analysis.differential_diagnoses && analysis.differential_diagnoses.length > 0) {
    addNewPageIfNeeded(20);
    pdf.setTextColor(...colors.navy);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text("DIFFERENTIAL DIAGNOSES", margin, y + 4);
    pdf.setFont("helvetica", "normal");
    y += 8;

    analysis.differential_diagnoses.forEach((dd) => {
      addNewPageIfNeeded(6);
      pdf.setFillColor(...colors.lightGray);
      pdf.circle(margin + 3, y + 2, 1, "F");
      pdf.setTextColor(...colors.text);
      pdf.setFontSize(7.5);
      pdf.text(dd, margin + 7, y + 3.5);
      y += 6;
    });
    y += 4;
  }

  // ── Recommendations ──
  if (analysis.recommendations && analysis.recommendations.length > 0) {
    addNewPageIfNeeded(20);
    pdf.setTextColor(...colors.navy);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text("RECOMMENDATIONS", margin, y + 4);
    pdf.setFont("helvetica", "normal");
    y += 8;

    analysis.recommendations.forEach((rec, i) => {
      addNewPageIfNeeded(10);
      pdf.setFillColor(...colors.blue);
      pdf.roundedRect(margin, y, 12, 6, 1, 1, "F");
      pdf.setTextColor(...colors.white);
      pdf.setFontSize(7);
      pdf.text(`${i + 1}`, margin + 5, y + 4.2);

      pdf.setTextColor(...colors.text);
      pdf.setFontSize(7.5);
      const recLines = pdf.splitTextToSize(rec, contentW - 18);
      pdf.text(recLines, margin + 15, y + 4);
      y += recLines.length * 4 + 4;
    });
  }

  // ── Footer ──
  const pageCount = pdf.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    pdf.setPage(p);
    pdf.setFillColor(...colors.lightGray);
    pdf.rect(0, 285, W, 12, "F");
    pdf.setDrawColor(...colors.border);
    pdf.line(0, 285, W, 285);
    pdf.setTextColor(...colors.mutedText);
    pdf.setFontSize(6.5);
    pdf.text("AI-Assisted Analysis • For Clinical Reference Only • Not a Substitute for Professional Medical Diagnosis", W / 2, 290, { align: "center" });
    pdf.text(`Page ${p} of ${pageCount}`, W - margin, 290, { align: "right" });
    pdf.text("Powered by Gemini 2.5 Pro Vision", margin, 290);
  }

  pdf.save(`Achalasia_Report_${fileName.replace(/\.[^.]+$/, "")}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
