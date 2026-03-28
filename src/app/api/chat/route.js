const PRIMARY_MODEL = 'moonshotai/kimi-k2.5';
const FALLBACK_MODEL = 'moonshotai/kimi-k2.5';

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

    const makeRequest = (model) => {
      return new Promise((resolve, reject) => {
        const payload = JSON.stringify({
          model,
          stream: true,
          max_tokens: 8000,
          messages: [
            { role: 'system', content: systemPrompt || SYSTEM_PROMPT },
            { role: 'user', content: prompt }
          ],
        });

        const req = require('https').request({
          hostname: 'openrouter.ai',
          port: 443,
          path: '/api/v1/chat/completions',
          method: 'POST',
          family: 4, // Force IPv4
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://tolzy.me',
            'X-Title': 'Tolzy AI',
            'Content-Length': Buffer.byteLength(payload)
          }
        }, (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ ok: true, body: res });
          } else {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => reject(new Error(`Model ${model} failed: ${res.statusCode} — ${data.slice(0, 200)}`)));
          }
        });

        req.on('error', e => reject(e));
        req.write(payload);
        req.end();
      });
    };

    let upstreamResponse;
    try {
      upstreamResponse = await makeRequest(PRIMARY_MODEL);
    } catch (err) {
      console.warn('Primary model failed, falling back...', err.message);
      upstreamResponse = await makeRequest(FALLBACK_MODEL);
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        upstreamResponse.body.on('data', chunk => {
          controller.enqueue(chunk);
        });
        upstreamResponse.body.on('end', () => {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        });
        upstreamResponse.body.on('error', e => {
          controller.error(e);
        });
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
