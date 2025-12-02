import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function callAIWithRetry(messages: any[], apiKey: string, retries = 3): Promise<any> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    console.log(`AI call attempt ${attempt}/${retries}`);
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        max_tokens: 500,
      }),
    });

    if (response.ok) {
      return response.json();
    }

    const errorText = await response.text();
    console.error(`AI gateway error (attempt ${attempt}):`, response.status, errorText);

    // Retry on 503 (service unavailable) or 429 (rate limit)
    if ((response.status === 503 || response.status === 429) && attempt < retries) {
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      continue;
    }

    if (response.status === 429) {
      throw { status: 429, message: "Rate limit exceeded. Please try again later." };
    }
    if (response.status === 402) {
      throw { status: 402, message: "Usage limit reached. Please add credits." };
    }
    if (response.status === 503) {
      throw { status: 503, message: "AI service temporarily unavailable. Please try again." };
    }
    
    throw { status: response.status, message: `AI gateway error: ${response.status}` };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { screenshot, transcript } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Analyzing screen capture...", { hasScreenshot: !!screenshot, hasTranscript: !!transcript });

    const messages: any[] = [
      {
        role: "system",
        content: `You are a lecture note-taking assistant. Your job is to analyze lecture content and create concise bullet-point notes.

RULES:
- Output ONLY bullet points, no paragraphs
- Each bullet should be a single, clear concept
- Keep bullets short (max 15 words)
- Focus on key definitions, facts, and concepts
- If there's text visible on screen, extract the main points
- If there's speech transcript, summarize the key ideas
- Return 2-5 bullet points per analysis
- Format: Return JSON array of strings, each string is one bullet point

Example output:
["Definition: Compiler converts high-level code to machine code", "Lexical analysis breaks code into tokens", "Syntax analysis builds parse tree"]`
      }
    ];

    // Build content array for the user message
    const content: any[] = [];
    
    if (screenshot) {
      content.push({
        type: "image_url",
        image_url: {
          url: screenshot
        }
      });
      content.push({
        type: "text",
        text: "Analyze this lecture slide/screen and extract key points as bullet notes."
      });
    }
    
    if (transcript) {
      content.push({
        type: "text",
        text: `Also consider this spoken content: "${transcript}"`
      });
    }

    if (content.length === 0) {
      return new Response(JSON.stringify({ bullets: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    messages.push({ role: "user", content });

    const data = await callAIWithRetry(messages, LOVABLE_API_KEY);
    const aiResponse = data.choices?.[0]?.message?.content || "";
    
    console.log("AI response:", aiResponse);

    // Parse the response - try to extract JSON array
    let bullets: string[] = [];
    try {
      // Try to find JSON array in response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        bullets = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: split by newlines and clean up
        bullets = aiResponse
          .split('\n')
          .map((line: string) => line.replace(/^[-•*]\s*/, '').trim())
          .filter((line: string) => line.length > 5);
      }
    } catch (e) {
      console.error("Failed to parse bullets:", e);
      bullets = aiResponse
        .split('\n')
        .map((line: string) => line.replace(/^[-•*]\s*/, '').trim())
        .filter((line: string) => line.length > 5);
    }

    return new Response(JSON.stringify({ bullets }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("Error in analyze-screen function:", error);
    const status = error.status || 500;
    const errorMessage = error.message || 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
