import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function buildPrompt(level: number, genre: string): string {
  return `You are a children's story writer for grade ${level} readers (ages 7-10). The story MUST match this genre theme: "${genre}". Generate a fun, engaging story of about 200-250 words. Give the story a creative title. In the JSON output, set the "genre" field to this exact string: "${genre}".

Then create ALL of the following activities based on that SINGLE story:

1. VOCABULARY: Pick 5 challenging but grade-appropriate vocabulary words from the story. For each word, provide the correct meaning and 2 plausible but incorrect meanings. Also provide the 0-based index of the correct option.

2. FACT vs OPINION: Create 5 statements related to the story - some facts and some opinions.

3. SUMMARIES: Provide 3 possible summaries - only one should be the best/correct summary, the others should be too detailed, too vague, or slightly inaccurate.

4. CHARACTER TRAITS: Ask 3 multiple-choice questions about the main character's traits. Each question should have 3 options with the 0-based index of the correct answer.

5. COMPARE & CONTRAST: Write a SECOND short story (about 100 words) that shares some similarities with the first but also has clear differences. Then write one comparing question and a sample answer.

Return ONLY valid JSON in this exact format:
{"title":"...","genre":"...","story":"...","vocabulary":{"words":[{"word":"...","options":["correct","wrong1","wrong2"],"correctIndex":0},{"word":"...","options":["wrong","correct","wrong"],"correctIndex":1},{"word":"...","options":["wrong","wrong","correct"],"correctIndex":2},{"word":"...","options":["correct","wrong","wrong"],"correctIndex":0},{"word":"...","options":["wrong","correct","wrong"],"correctIndex":1}]},"factOpinion":{"statements":[{"text":"...","type":"fact"},{"text":"...","type":"opinion"},{"text":"...","type":"fact"},{"text":"...","type":"opinion"},{"text":"...","type":"fact"}]},"summaries":{"options":[{"text":"...","correct":false},{"text":"...","correct":true},{"text":"...","correct":false}]},"characterTraits":{"questions":[{"question":"...","options":["...","...","..."],"correctIndex":0},{"question":"...","options":["...","...","..."],"correctIndex":1},{"question":"...","options":["...","...","..."],"correctIndex":2}]},"compareContrast":{"story2":"...","question":"...","sampleAnswer":"..."}}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { gradeLevel, genre: genreRaw } = await req.json();
    const genre =
      typeof genreRaw === "string" && genreRaw.trim().length > 0
        ? genreRaw.trim()
        : "Adventure";
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: buildPrompt(gradeLevel || 2, genre) },
          {
            role: "user",
            content: `Please generate a new story in the "${genre}" style with all activities for grade ${gradeLevel || 2} students. Make it fun and educational!`,
          },
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
