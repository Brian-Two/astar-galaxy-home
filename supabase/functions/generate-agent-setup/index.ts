import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agentType, agentName, description } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert educational AI agent designer. Given an agent type, name, and description, generate a structured setup for the agent.

You must respond with ONLY valid JSON in this exact format:
{
  "learning_objectives": ["objective1", "objective2", ...],
  "guardrails": {
    "dont_give_full_answers_immediately": true/false,
    "ask_what_i_know_first": true/false,
    "stay_within_selected_sources": true/false,
    "keep_responses_concise": true/false,
    "avoid_or_never_do": ["item1", "item2", ...]
  },
  "scaffolding": {
    "level": "light" | "medium" | "heavy",
    "behaviors": ["behavior1", "behavior2", ...]
  }
}

Rules:
- Generate 2-5 learning objectives using measurable action verbs like: Explain, Solve, Compare, Build, Debug, Evaluate, Identify, Analyze, Apply, Create, Demonstrate
- Learning objectives should be specific and achievable
- Set guardrails appropriately for the agent type (tutors should ask questions first, explainers can be more direct)
- Scaffolding level should match the agent type:
  - Socratic tutors: typically "light" (more questions, less guidance)
  - Explainers: typically "medium" to "heavy" (more detailed explanations)
  - Quiz/Assessment agents: typically "light" (testing, not teaching)
  - Coaches: typically "medium" (balanced guidance)
- Generate 3-5 specific behaviors for the chosen scaffolding level
- avoid_or_never_do should contain 1-3 relevant restrictions`;

    const userPrompt = `Generate a setup for this educational AI agent:

Agent Type: ${agentType}
Agent Name: ${agentName}
Description: ${description}

Create appropriate learning objectives, guardrails, and scaffolding settings that match this agent's purpose.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON from the response
    // Handle potential markdown code blocks
    let jsonContent = content.trim();
    if (jsonContent.startsWith("```json")) {
      jsonContent = jsonContent.slice(7);
    }
    if (jsonContent.startsWith("```")) {
      jsonContent = jsonContent.slice(3);
    }
    if (jsonContent.endsWith("```")) {
      jsonContent = jsonContent.slice(0, -3);
    }
    jsonContent = jsonContent.trim();

    const generatedSetup = JSON.parse(jsonContent);

    // Validate the response structure
    if (!generatedSetup.learning_objectives || !Array.isArray(generatedSetup.learning_objectives) || generatedSetup.learning_objectives.length === 0) {
      throw new Error("Invalid response: learning_objectives must be a non-empty array");
    }

    return new Response(JSON.stringify(generatedSetup), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-agent-setup error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
