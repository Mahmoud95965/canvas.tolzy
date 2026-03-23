const PRIMARY_MODEL = 'qwen/qwen3-235b-a22b-2507';
const FALLBACK_MODEL = 'google/gemini-2.0-flash-exp:free';

const SYSTEM_PROMPT = `You are Tolzy AI, a world-class UI/UX designer and frontend engineer. 
Your goal is to create stunning, premium, and functional web components or pages based on user prompts.
- Use modern CSS (Flexbox, Grid, Animations, Gradients).
- Use Lucide icons (via CDN: https://unpkg.com/lucide@latest).
- Ensure the design is responsive and feel "premium" (vibrant colors, glassmorphism, smooth transitions).
- IMPORTANT: Always return a single block of code containing HTML, CSS, and JS. 
- Use <style> and <script> tags within the HTML.
- Do not provide explanations unless asked. Just output the code block.`;

export async function POST(req) {
  try {
    const { prompt, systemPrompt } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key is not configured' }), { status: 500 });
    }

    const makeRequest = async (model) => {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://tolzy.me',
          'X-Title': 'Tolzy AI',
        },
        body: JSON.stringify({
          model,
          stream: true,
          include_reasoning: true,
          max_tokens: 16000,
          messages: [
            { role: 'system', content: systemPrompt || SYSTEM_PROMPT },
            { role: 'user', content: prompt }
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Model ${model} failed with status ${response.status}`);
      }
      return response;
    };

    let upstreamResponse;
    try {
      upstreamResponse = await makeRequest(PRIMARY_MODEL);
    } catch (err) {
      console.warn('Primary model failed, falling back...', err.message);
      upstreamResponse = await makeRequest(FALLBACK_MODEL);
    }

    // Stream the response back to the client
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const reader = upstreamResponse.body.getReader();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
              break;
            }
            // Forward the chunk as-is
            controller.enqueue(value);
          }
        } catch (e) {
          controller.error(e);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
