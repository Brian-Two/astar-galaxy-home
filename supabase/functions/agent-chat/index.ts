import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AgentConfig {
  agent_type: string;
  name: string;
  description: string;
  learning_objectives: { text: string; visible: boolean }[];
  guardrails: {
    dontGiveFullAnswers?: boolean;
    stayWithinSources?: boolean;
    neverBreakCharacter?: boolean;
    adaptToUserLevel?: boolean;
    encourageReflection?: boolean;
    limitResponseLength?: boolean;
  };
  scaffolding_level: string;
  scaffolding_behaviors: string[];
  source_mode: string;
  sources_context?: string;
  active_objective_text?: string;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

function buildSystemPrompt(config: AgentConfig): string {
  const lines: string[] = [];

  // Agent identity based on type
  const typeIdentities: Record<string, string> = {
    'socratic-tutor': 'You are a Socratic tutor who guides learning through questions rather than direct answers.',
    'explainer': 'You are an expert explainer who breaks down complex concepts into simple, understandable parts.',
    'quiz-master': 'You are a quiz master who tests knowledge through questions and provides feedback.',
    'flashcard-creator': 'You are a flashcard creator who helps create and review study materials.',
    'study-planner': 'You are a study planner who helps organize learning goals and create study schedules.',
    'research-assistant': 'You are a research assistant who helps gather, synthesize, and analyze information.',
    'essay-coach': 'You are an essay coach who helps with writing, structure, and argumentation.',
    'problem-solver': 'You are a problem-solving guide who helps work through complex problems step by step.',
    'debate-partner': 'You are a debate partner who helps explore different perspectives on topics.',
    'project-manager': 'You are a project manager who helps break down projects into manageable tasks.',
    'code-mentor': 'You are a code mentor who helps with programming concepts and code review.',
    'language-tutor': 'You are a language tutor who helps with language learning and practice.',
    'memorization-coach': 'You are a memorization coach who helps with memory techniques and retention.',
    'concept-mapper': 'You are a concept mapper who helps visualize relationships between ideas.',
    'practice-coach': 'You are a practice coach who provides exercises and drills for skill development.',
    'summary-writer': 'You are a summary writer who helps condense and synthesize information.',
  };

  const baseIdentity = typeIdentities[config.agent_type] || 'You are a helpful learning assistant.';
  lines.push(baseIdentity);

  // Add creator description with high priority
  if (config.description) {
    lines.push('');
    lines.push('IMPORTANT - Your specific purpose and behavior:');
    lines.push(config.description);
  }

  // Add active objective if selected
  if (config.active_objective_text) {
    lines.push('');
    lines.push(`CURRENT LEARNING OBJECTIVE: ${config.active_objective_text}`);
    lines.push('Focus your responses on helping achieve this objective.');
  }

  // Add guardrails
  const activeGuardrails: string[] = [];
  if (config.guardrails.dontGiveFullAnswers) {
    activeGuardrails.push('- Do NOT give full answers directly. Guide the user to discover answers themselves.');
  }
  if (config.guardrails.stayWithinSources) {
    activeGuardrails.push('- Stay within the provided sources and context. Do not introduce outside information.');
  }
  if (config.guardrails.neverBreakCharacter) {
    activeGuardrails.push('- Never break character or acknowledge that you are an AI.');
  }
  if (config.guardrails.adaptToUserLevel) {
    activeGuardrails.push('- Adapt your language and complexity to match the user\'s apparent level.');
  }
  if (config.guardrails.encourageReflection) {
    activeGuardrails.push('- Encourage reflection by asking follow-up questions about what the user has learned.');
  }
  if (config.guardrails.limitResponseLength) {
    activeGuardrails.push('- Keep responses concise and focused. Avoid lengthy explanations.');
  }

  if (activeGuardrails.length > 0) {
    lines.push('');
    lines.push('BEHAVIOR RULES:');
    lines.push(...activeGuardrails);
  }

  // Add scaffolding behaviors
  if (config.scaffolding_behaviors && config.scaffolding_behaviors.length > 0) {
    lines.push('');
    lines.push(`SCAFFOLDING LEVEL: ${config.scaffolding_level}`);
    lines.push('Scaffolding behaviors to apply:');
    config.scaffolding_behaviors.forEach(b => lines.push(`- ${b}`));
  }

  // Add sources context
  if (config.sources_context) {
    lines.push('');
    lines.push('CONTEXT FROM SOURCES:');
    lines.push(config.sources_context);
  }

  return lines.join('\n');
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, agentConfig } = await req.json() as {
      messages: Message[];
      agentConfig: AgentConfig;
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build system prompt from agent config
    const systemPrompt = buildSystemPrompt(agentConfig);

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
          ...messages,
        ],
        stream: true,
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
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("agent-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
