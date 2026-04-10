/**
 * اختبر اتصالك مع Google Gemini API
 * 
 * طريقة الاستخدام:
 * 1. تأكد من إضافة GOOGLE_API_KEY إلى .env.local
 * 2. شغّل: npm run dev
 * 3. افتح: http://localhost:3000/api/debug/gemini-test
 */

import { NextRequest, NextResponse } from 'next/server';
import { isGeminiConfigured, geminiSingleRequest } from '@/lib/gemini-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const SYSTEM_PROMPT = `You are a helpful assistant testing Google Gemini integration.
Respond in Arabic if the user writes in Arabic, otherwise respond in English.`;

async function testGeminiConnection(): Promise<{
  success: boolean;
  message: string;
  details?: unknown;
  error?: string;
}> {
  try {
    // 1. تحقق من المكتبة
    if (!isGeminiConfigured()) {
      return {
        success: false,
        message: 'GOOGLE_API_KEY is not configured in environment variables',
        details: 'Add GOOGLE_API_KEY to .env.local to enable Gemini',
      };
    }

    // 2. اختبر اتصال بسيط
    const testPrompt = 'قل مرحباً وأخبرني أنك تعمل بكفاءة';
    const response = await geminiSingleRequest(testPrompt, SYSTEM_PROMPT, false);

    return {
      success: true,
      message: 'Gemini is working perfectly! ✅',
      details: {
        response: response.substring(0, 200) + (response.length > 200 ? '...' : ''),
        fullLength: response.length,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      message: 'Gemini connection failed ❌',
      error: errorMessage,
      details: {
        timestamp: new Date().toISOString(),
        tips: [
          '1. تأكد من GOOGLE_API_KEY في .env.local',
          '2. تحقق من صلاحيات الـ API key',
          '3. تأكد أنك في منطقة مدعومة',
          '4. تحقق من الحد الأقصى للطلبات (1500/يوم)',
        ],
      },
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    const result = await testGeminiConnection();

    // إرجع JSON + HTML للعرض الجميل
    const html = `
      <!DOCTYPE html>
      <html lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Gemini Connection Test</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            direction: rtl;
          }
          .container {
            background: #0f3460;
            border: 2px solid ${result.success ? '#00d4ff' : '#ff6b6b'};
            border-radius: 12px;
            padding: 40px;
            max-width: 600px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          }
          h1 {
            color: ${result.success ? '#00d4ff' : '#ff6b6b'};
            margin-bottom: 20px;
            font-size: 28px;
          }
          .status {
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 20px;
            background: ${result.success ? 'rgba(0, 212, 255, 0.1)' : 'rgba(255, 107, 107, 0.1)'};
            border-left: 4px solid ${result.success ? '#00d4ff' : '#ff6b6b'};
          }
          .status p {
            color: #e0e0e0;
            font-size: 16px;
            line-height: 1.6;
          }
          .details {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            padding: 16px;
            margin-top: 20px;
            font-family: 'Courier New', monospace;
            color: #a0a0a0;
            font-size: 13px;
            overflow-x: auto;
          }
          .details pre {
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          .tips {
            background: rgba(255, 193, 7, 0.1);
            border-left: 4px solid #ffc107;
            padding: 16px;
            margin-top: 20px;
            border-radius: 8px;
          }
          .tips h3 {
            color: #ffc107;
            font-size: 14px;
            margin-bottom: 10px;
          }
          .tips ul {
            list-style: none;
            color: #d9d9d9;
            font-size: 13px;
          }
          .tips li {
            padding: 6px 0;
            border-bottom: 1px solid rgba(255, 193, 7, 0.2);
          }
          .tips li:last-child {
            border-bottom: none;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            color: #a0a0a0;
            font-size: 12px;
            text-align: center;
          }
          code {
            background: rgba(0, 0, 0, 0.3);
            padding: 4px 8px;
            border-radius: 4px;
            color: #00d4ff;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${result.success ? '✅ متصل بنجاح!' : '❌ فشل الاتصال'}</h1>
          
          <div class="status">
            <p><strong>الحالة:</strong> ${result.message}</p>
          </div>

          ${
            result.details
              ? `
            <div class="details">
              <pre>${JSON.stringify(result.details, null, 2)}</pre>
            </div>
          `
              : ''
          }

          ${
            result.error
              ? `
            <div class="tips">
              <h3>❌ الخطأ:</h3>
              <pre>${result.error}</pre>
              <h3 style="margin-top: 12px;">💡 حلول مقترحة:</h3>
              <ul>
                <li>✓ أضف <code>GOOGLE_API_KEY</code> إلى <code>.env.local</code></li>
                <li>✓ تأكد من الـ API key صحيح من <a href="https://aistudio.google.com/apikey" style="color: #00d4ff;">https://aistudio.google.com/apikey</a></li>
                <li>✓ تحقق من تفعيل Google Generative AI API</li>
                <li>✓ تأكد من تشغيل <code>npm install @google/generative-ai</code></li>
              </ul>
            </div>
          `
              : ''
          }

          <div class="footer">
            <p>اختبار اتصال Gemini - ${new Date().toLocaleString('ar-EG')}</p>
            <p>📚 <a href="/GEMINI_SETUP.md" style="color: #00d4ff; text-decoration: none;">اقرأ التوثيق الكامل</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Test encountered an error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
