# Google Gemini Integration with Search Grounding

## نظرة عامة
تم تكامل Google Gemini 1.5 Flash مع ميزة **Search Grounding** في Tolzy. هذا يسمح بـ:
- ✅ إجابات موثوقة مع معلومات حية من جوجل
- ✅ دعم كامل للعربية
- ✅ غير محدود تقريباً من الطلبات (1,500 يومياً مجاناً)

## المميزات

### Search Grounding (البحث المباشر)
عندما يسأل المستخدم عن:
- "أسعار الدولار الحالية"
- "آخر إصدار من Next.js"
- "أخبار اليوم"

**الموديل يبحث في جوجل الأول** ثم يجاوب بناءً على النتائج المباشرة، مع ذكر المصادر.

### الحدود المجانية
| المعيار | القيمة |
|--------|--------|
| الطلبات اليومية (RPD) | **1,500** |
| الطلبات في الدقيقة (RPM) | 15 |
| التكلفة | **مجاني** 💚 |
| أقصى توكن في الطلب الواحد | 1,000,000 |

## الإعداد

### 1. الحصول على مفتاح API
اذهب إلى: https://aistudio.google.com/apikey
- اضغط "Create API Key"
- اختر أو أنشئ project جديد
- انسخ المفتاح

### 2. تحديث .env.local
```env
GOOGLE_API_KEY=your-api-key-here
```

### 3. تثبيت المكتبة
```bash
npm install @google/generative-ai
```

## الاستخدام

### من الـ Frontend
```javascript
const response = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${firebaseToken}`
  },
  body: JSON.stringify({
    provider: 'gemini',  // استخدم 'gemini' لتفعيل Gemini
    modelType: 'flash',
    messages: [
      { role: 'user', content: 'ما هي أحدث نسخة من React؟' }
    ]
  })
});

const answer = await response.text();
```

### الخيارات المتاحة
```javascript
{
  provider: 'gemini',              // 'gemini' أو 'openrouter'
  modelType: 'flash',              // نوع الموديل
  messages: [],                    // سجل المحادثة
  enableSearchGrounding: true,     // تفعيل البحث (افتراضي)
  temperature: 0.2                 // درجة الإبداع
}
```

## البنية التقنية

### `/src/lib/gemini-service.ts`
يحتوي على:
- `geminiChatWithGrounding()` - للمحادثات مع السجل
- `geminiSingleRequest()` - للطلبات الفردية
- `isGeminiConfigured()` - للتحقق من الإعدادات

### `/src/app/api/ai/chat/route.ts`
التحديثات:
- يدعم `provider` parameter
- يختار تلقائياً بين Gemini و OpenRouter
- معالجة أخطاء مميزة لكل API

## معالجة الأخطاء

### الحالات المحتملة
```javascript
// 429 - تجاوز الحد اليومي (1500 طلب)
{
  error: 'UPSTREAM_RATE_LIMIT',
  message: 'تم تجاوز حد الطلبات'
}

// 401 - عدم توثيق
{
  error: 'Unauthorized'
}

// 500 - مشكلة في الإعداد
{
  error: 'Gemini API configuration error'
}
```

## الاختبار

### اختبار سريع
```bash
# 1. تأكد من إضافة GOOGLE_API_KEY إلى .env.local
# 2. شغّل الخادم
npm run dev

# 3. استخدم cURL أو Postman
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -d '{
    "provider": "gemini",
    "modelType": "flash",
    "messages": [
      {"role": "user", "content": "السلام عليكم"}
    ]
  }'
```

## الفروقات بين Gemini و OpenRouter

| الميزة | Gemini | OpenRouter |
|--------|--------|-----------|
| Search Grounding | ✅ مدمج | ❌ لا |
| السعر | 💚 مجاني | 💰 مدفوع |
| دعم العربية | ✅ ممتاز | ⚠️ جيد |
| السرعة | ⚡ سريع جداً | ⚡ متوسط |
| المرونة | ⚠️ أقل | ✅ أكثر |

## النصائح

1. **للمعلومات الحية** → استخدم Gemini مع Search Grounding
2. **للإبداع** → OpenRouter قد يكون أفضل
3. **للعربية الدارجة** → Gemini أفضل في الفهم الثقافي
4. **للتكلفة** → Gemini مجاني تماماً (حتى الآن)

## الموارد

- [Google AI Studio](https://aistudio.google.com)
- [Gemini API Docs](https://ai.google.dev)
- [Search Grounding Guide](https://ai.google.dev/docs/grounding)
- [Price Calculator](https://ai.google.dev/pricing)

---

**ملاحظة:** هذا التكامل جاهز للإنتاج. تأكد من تخزين API keys بشكل آمن وعدم expose'ها على الـ client side.
