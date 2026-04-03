import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PROMPTS: Record<string, (level: number) => string> = {
  vocabulary: (level) => `You are a children's story writer for grade ${level} readers (ages 7-10). Generate a fun, engaging story of about 200 words. Then pick 5 challenging but grade-appropriate vocabulary words from the story and provide their meanings.

Return ONLY valid JSON in this exact format:
{"story":"...","words":[{"word":"...","meaning":"..."},{"word":"...","meaning":"..."},{"word":"...","meaning":"..."},{"word":"...","meaning":"..."},{"word":"...","meaning":"..."}]}`,

  "compare-contrast": (level) => `You are a children's story writer for grade ${level} readers. Generate 2 short stories (about 100 words each) that share some similarities but also have clear differences. Then write one comparing question and a sample answer.

Return ONLY valid JSON:
{"story1":"...","story2":"...","question":"...","sampleAnswer":"..."}`,

  "fact-opinion": (level) => `You are a children's story writer for grade ${level} readers. Write a ~200 word story. Then create 5 statements related to the story - some facts and some opinions.

Return ONLY valid JSON:
{"story":"...","statements":[{"text":"...","type":"fact"},{"text":"...","type":"opinion"},{"text":"...","type":"fact"},{"text":"...","type":"opinion"},{"text":"...","type":"fact"}]}`,

  summaries: (level) => `You are a children's story writer for grade ${level} readers. Write a ~200 word story. Then provide 3 possible summaries - only one should be the best/correct summary, the others should be too detailed, too vague, or slightly inaccurate.

Return ONLY valid JSON:
{"story":"...","options":[{"text":"...","correct":false},{"text":"...","correct":true},{"text":"...","correct":false}]}`,

  "character-traits": (level) => `You are a children's story writer for grade ${level} readers. Write a ~200 word story with a clear main character who shows distinct personality traits. Then ask 3 multiple-choice questions about the character's traits. Each question should have 3 options.

Return ONLY valid JSON:
{"story":"...","questions":[{"question":"...","options":["...","...","..."],"correctIndex":0},{"question":"...","options":["...","...","..."],"correctIndex":1},{"question":"...","options":["...","...","..."],"correctIndex":2}]}`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { activityType, gradeLevel } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const promptFn = PROMPTS[activityType];
    if (!promptFn) throw new Error(`Unknown activity type: ${activityType}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: promptFn(gradeLevel || 2) },
          { role: "user", content: `Please generate a new ${activityType} activity for grade ${gradeLevel || 2} students. Make it fun and educational!` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI error:", response.status, text);
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    // Extract JSON from the response (handle markdown code blocks)
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
    const jsonStr = (jsonMatch[1] || content).trim();

    const parsed = JSON.parse(jsonStr);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-story error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
