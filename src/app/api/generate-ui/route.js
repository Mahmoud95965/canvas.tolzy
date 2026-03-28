import { supabase } from '@/lib/supabase';

const PRIMARY_MODEL = 'black-forest-labs/flux.2-klein-4b';
const FALLBACK_MODEL = 'black-forest-labs/flux.2-klein-4b';

export const maxDuration = 60; // Allow 60 seconds

export async function POST(req) {
  try {
    const { prompt, userId } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key is not configured' }), { status: 500 });
    }

    if (!prompt?.trim()) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400 });
    }

    // --- Daily Limit Check ---
    if (userId) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startOfDay = today.toISOString();

      const { count, error: countError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('updated_at', startOfDay)
        .not('content->imageUrl', 'is', null);

      if (countError) {
        console.error('Limit check error:', countError);
      } else if (count >= 10) {
        return new Response(JSON.stringify({ 
          error: 'لقد استنفدت حدك اليومي (10 صور). حاول مرة أخرى غداً للحفاظ على جودة الخدمة للجميع.' 
        }), { status: 429 });
      }
    }
    // ------------------------

    const makeRequest = (model) => {
      return new Promise((resolve, reject) => {
        const payload = JSON.stringify({
          model,
          max_tokens: 1000,
          messages: [
            { role: 'user', content: prompt }
          ],
        });

        const req = require('https').request({
          hostname: 'openrouter.ai',
          port: 443,
          path: '/api/v1/chat/completions',
          method: 'POST',
          family: 4, // Force IPv4 to fix ENETUNREACH
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://tolzy.me',
            'X-Title': 'Tolzy Image AI',
            'Content-Length': Buffer.byteLength(payload)
          }
        }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
             if (res.statusCode >= 200 && res.statusCode < 300) {
               try {
                 resolve({ json: () => JSON.parse(data) });
               } catch (e) {
                 reject(new Error('Invalid JSON from OpenRouter'));
               }
             } else {
                 let errorMsg = data;
                 try {
                     const parsed = JSON.parse(data);
                     if (parsed.error && parsed.error.message) {
                         errorMsg = parsed.error.message;
                     }
                 } catch(e) {}
                 reject(new Error(`API Error ${res.statusCode}: ${errorMsg}`));
             }
          });
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
      console.warn('Primary model failed, throwing...', err.message);
      throw err;
    }

    const data = await upstreamResponse.json();
    const choice = data.choices?.[0];
    const rawContent = choice?.message?.content;
    const images = choice?.message?.images;

    let imageUrl = '';

    // 1. Check for images array (some models like Flux return base64 here)
    if (images && images.length > 0) {
      let img = images[0];
      
      // Handle if it's an object (OpenAI-compatible format)
      if (typeof img === 'object' && img !== null) {
        img = img.url || img.b64_json || img.image_url?.url || '';
      }

      if (typeof img === 'string' && img.length > 0) {
        if (img.startsWith('http')) {
          imageUrl = img;
        } else {
          // Assume it's base64, ensure prefix
          imageUrl = img.startsWith('data:image') ? img : `data:image/png;base64,${img}`;
        }
      }
    } 
    // 2. Fallback to content extraction
    else if (rawContent) {
      imageUrl = rawContent.trim();
      const urlMatch = rawContent.match(/(https?:\/\/[^\s")]+)/);
      if (urlMatch && (urlMatch[1].includes('.png') || urlMatch[1].includes('.jpg') || urlMatch[1].includes('.jpeg') || urlMatch[1].includes('.webp') || urlMatch[1].includes('openrouter'))) {
        imageUrl = urlMatch[1];
      } else if (urlMatch && rawContent.includes('![')) {
        imageUrl = urlMatch[1];
      }
    }

    if (!imageUrl) {
      console.error("No image found in AI response. Full data:", JSON.stringify(data));
      if (data.error) {
         return new Response(JSON.stringify({ error: data.error.message || 'OpenRouter API Error' }), { status: 502 });
      }
      return new Response(JSON.stringify({ error: 'لم يتم العثور على صورة في استجابة الخادم. حاول مرة أخرى.' }), { status: 502 });
    }

    return new Response(JSON.stringify({
      imageUrl: imageUrl
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Generate Image API error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
