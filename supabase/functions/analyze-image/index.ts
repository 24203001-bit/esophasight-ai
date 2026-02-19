import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a board-certified gastroenterologist and radiologist AI specialized in esophageal motility disorders, particularly Achalasia Cardia (also known as Esophageal Achalasia or Cardiospasm).

You are analyzing a medical image (barium swallow, endoscopy, high-resolution manometry, CT, or X-ray) for signs of Achalasia.

Your analysis must follow this exact JSON structure. Return ONLY valid JSON, no markdown:

{
  "diagnosis": "Positive" or "Negative" or "Inconclusive",
  "confidence": number between 0-100,
  "achalasia_type": "Type I (Classic)" or "Type II (Panesophageal pressurization)" or "Type III (Spastic)" or "Not Applicable",
  "accuracy_score": number between 0-100 (how accurate/reliable you believe this specific analysis is based on image quality and findings clarity),
  "findings": [
    {
      "finding": "string describing the finding",
      "severity": "Normal" or "Mild" or "Moderate" or "Severe",
      "location": "string describing anatomical location"
    }
  ],
  "key_indicators": {
    "bird_beak_sign": boolean,
    "dilated_esophagus": boolean,
    "absent_peristalsis": boolean,
    "food_retention": boolean,
    "narrowed_les": boolean,
    "sigmoid_esophagus": boolean
  },
  "differential_diagnoses": ["string"],
  "recommendations": ["string"],
  "clinical_notes": "string - keep this to 2-3 concise sentences maximum, focusing only on the most critical clinical interpretation",
  "image_quality": "Excellent" or "Good" or "Fair" or "Poor",
  "image_type_detected": "string describing the type of medical image"
}

DIAGNOSTIC THRESHOLDS (you MUST follow these):
- confidence >= 70 AND 2+ key indicators positive → diagnosis: "Positive"
- confidence >= 50 AND 1+ key indicators positive → diagnosis: "Positive" (with lower confidence noted)
- confidence < 50 OR 0 key indicators positive → diagnosis: "Negative"
- Only use "Inconclusive" if image quality is "Poor" or image is not a relevant medical image

CLASSIFICATION RULES:
- NEVER use "Cannot determine" for achalasia_type. Always classify as one of: Type I, Type II, Type III, or "Not Applicable"
- If diagnosis is "Negative", set achalasia_type to "Not Applicable"
- If diagnosis is "Positive", you MUST classify the type based on available evidence (default to Type I if unclear)

Be thorough, precise, and use evidence-based medicine. Reference established diagnostic criteria from the Chicago Classification v4.0 for achalasia when applicable.

IMPORTANT: Consider findings from published datasets and literature on Achalasia, Esophageal Achalasia, and Cardiospasm to inform your analysis. Key radiological signs include:
- Bird's beak sign (tapered narrowing at GEJ)
- Dilated esophageal body (>3cm)  
- Absence of normal peristaltic waves
- Retained food/fluid in esophagus
- Sigmoid-shaped esophagus in advanced cases
- Air-fluid levels in esophagus`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, mimeType, fileName } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "No image data provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this medical image for Achalasia Cardia. The file name is: "${fileName || 'unknown'}". Provide a comprehensive diagnostic assessment following the exact JSON structure specified. Use your knowledge of published achalasia radiology datasets and diagnostic criteria.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType || "image/jpeg"};base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI analysis failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No analysis content returned");
    }

    // Parse the JSON from the response (may be wrapped in markdown code blocks)
    let analysisResult;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      analysisResult = JSON.parse(jsonMatch[1].trim());
    } catch {
      // If JSON parsing fails, return raw content
      analysisResult = { 
        diagnosis: "Inconclusive",
        confidence: 0,
        accuracy_score: 0,
        clinical_notes: content,
        findings: [],
        key_indicators: {},
        differential_diagnoses: [],
        recommendations: ["Manual review required - AI response format error"],
        image_quality: "Unknown",
        image_type_detected: "Unknown"
      };
    }

    return new Response(
      JSON.stringify({ analysis: analysisResult, fileName }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Analysis error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Analysis failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
