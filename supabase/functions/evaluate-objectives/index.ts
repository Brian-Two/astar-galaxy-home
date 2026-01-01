import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Objective {
  index: number;
  text: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { objectives, messages } = await req.json() as {
      objectives: Objective[];
      messages: Message[];
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!objectives || objectives.length === 0) {
      return new Response(JSON.stringify({ hit: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build conversation summary
    const conversationText = messages
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n');

    const objectivesList = objectives
      .map(o => `[${o.index}] ${o.text}`)
      .join('\n');

    const systemPrompt = `You are an objective completion evaluator for a learning assistant. Your task is to analyze a conversation and determine which learning objectives have been clearly achieved.

LEARNING OBJECTIVES:
${objectivesList}

RULES:
- Only mark an objective as "hit" if there is CLEAR EVIDENCE in the conversation that the student has demonstrated understanding or achievement of that objective.
- Be conservative - if uncertain, do NOT mark it as hit.
- Look for explicit demonstrations of knowledge, correct answers, or clear explanations by the student.
- The assistant explaining something is NOT sufficient - the student must show understanding.

Respond ONLY with a JSON object in this exact format:
{"hit": [0, 2]}

Where the array contains the indexes of objectives that are clearly achieved. If none are hit, respond with:
{"hit": []}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this conversation and determine which objectives are hit:\n\n${conversationText}` },
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status, await response.text());
      return new Response(JSON.stringify({ hit: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{"hit": []}';

    // Parse the JSON response
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const hitIndexes = Array.isArray(parsed.hit) ? parsed.hit.filter((n: unknown) => typeof n === 'number') : [];
        return new Response(JSON.stringify({ hit: hitIndexes }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError, content);
    }

    return new Response(JSON.stringify({ hit: [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("evaluate-objectives error:", e);
    return new Response(JSON.stringify({ hit: [], error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
