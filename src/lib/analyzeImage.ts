import { supabase } from "@/integrations/supabase/client";

export interface AnalysisResult {
  diagnosis: string;
  confidence: number;
  achalasia_type: string;
  findings: Array<{
    finding: string;
    severity: string;
    location: string;
  }>;
  key_indicators: {
    bird_beak_sign?: boolean;
    dilated_esophagus?: boolean;
    absent_peristalsis?: boolean;
    food_retention?: boolean;
    narrowed_les?: boolean;
    sigmoid_esophagus?: boolean;
  };
  differential_diagnoses: string[];
  recommendations: string[];
  clinical_notes: string;
  image_quality: string;
  image_type_detected: string;
}

export async function analyzeImage(
  file: File
): Promise<{ analysis: AnalysisResult; fileName: string }> {
  const base64 = await fileToBase64(file);
  
  const { data, error } = await supabase.functions.invoke("analyze-image", {
    body: {
      imageBase64: base64,
      mimeType: file.type,
      fileName: file.name,
    },
  });

  if (error) throw new Error(error.message || "Analysis failed");
  if (data.error) throw new Error(data.error);
  return data;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
