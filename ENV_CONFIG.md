# 🔧 Tolzy Flow - متغيرات البيئة والتكوين

هذا الملف يوضح جميع متغيرات البيئة المطلوبة والاختيارية لتشغيل مشروع Tolzy Flow بنجاح.

---

## 📋 جدول المحتويات
1. [متغيرات مطلوبة](#متغيرات-مطلوبة)
2. [متغيرات اختيارية](#متغيرات-اختيارية)
3. [قائمة التحقق](#قائمة-التحقق)
4. [مشاكل شائعة وحلولها](#مشاكل-شائعة-وحلولها)

---

## ✅ متغيرات مطلوبة

### 🔐 Firebase (Authentication)
```env
# Public Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=<your-firebase-api-key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=auth.tolzy.me
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<your-project-id>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<your-bucket>.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
NEXT_PUBLIC_FIREBASE_APP_ID=<your-app-id>
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=<your-measurement-id>
VITE_FIREBASE_DATABASE_URL=https://<your-project>-rtdb.firebaseio.com

# Firebase Admin SDK (للـ API Routes)
FIREBASE_PROJECT_ID=<your-project-id>
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@<your-project>.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

### 🗄️ Supabase (Database)
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...  # خادم - استخدام آمن فقط
```

### 🤖 AI Models - OpenRouter (Primary)
```env
OPENROUTER_API_KEY=sk-or-v1-...  # الحصول من https://openrouter.ai
OPENROUTER_CHAT_MODEL=anthropic/claude-3.5-sonnet
OPENROUTER_PRO_MODEL=anthropic/claude-3.5-sonnet
OPENROUTER_THINKER_MODEL=anthropic/claude-3.5-sonnet
OPENROUTER_CODE_MODEL=anthropic/claude-3.5-sonnet
```

### 🤖 AI Models - Google Gemini (Fallback/Search Grounding)
```env
GOOGLE_API_KEY=AIzaSy...  # الحصول من https://aistudio.google.com/apikey
```

### 💳 Stripe (Billing)
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_TOLZY_PRO=price_...  # Pro Plan (Monthly)
```

### 🌐 App Configuration
```env
NEXT_PUBLIC_APP_URL=https://ai.tolzy.me
NEXT_PUBLIC_APP_DOMAIN=ai.tolzy.me
NEXT_PUBLIC_GATEWAY_URL=http://localhost:3010  # في البيئة المحلية
NEXT_PUBLIC_ENABLE_GOOGLE_SIGNIN=true
```

---

## ⚙️ متغيرات اختيارية

### 🗄️ Billing Supabase (منفصل - مختياري)
إذا كنت تستخدم مثيل Supabase منفصل للفواتير:
```env
BILLING_SUPABASE_URL=https://<billing-project>.supabase.co
BILLING_SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```
**ملاحظة**: إذا لم تُعيّن، سيتم استخدام `SUPABASE_*` الرئيسية.

### 🔌 Integration Auth (للتطبيقات الأخرى)
للسماح لمشاريع خارجية بالوصول إلى معلومات الخطة:
```env
INTEGRATION_PROJECT_KEY=tolzy-flow
INTEGRATION_PROJECT_SECRET=<strong-random-secret>
INTEGRATION_TOKEN_SECRET=<long-random-secret-min-32-chars>

# أو لدعم عدة مشاريع:
INTEGRATION_PROJECTS_JSON=[
  {"key":"tolzy-flow","secret":"...","name":"Tolzy Flow"},
  {"key":"tolzy-learn","secret":"...","name":"Tolzy Learn"}
]
```

---

## ✔️ قائمة التحقق

استخدم هذه النموذج للتأكد من أن كل شيء مكوّن بشكل صحيح:

```bash
# 1️⃣ تحقق من Firebase
curl -X GET "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=$NEXT_PUBLIC_FIREBASE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'

# 2️⃣ تحقق من Supabase
npx ts-node -e "
  import { createClient } from '@supabase/supabase-js';
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  console.log('Supabase status:', client ? '✅' : '❌');
"

# 3️⃣ تحقق من OpenRouter
curl -X POST https://openrouter.ai/api/v1/health \
  -H "Authorization: Bearer $OPENROUTER_API_KEY"

# 4️⃣ تحقق من Google Gemini
npx ts-node -e "
  import { GoogleGenerativeAI } from '@google/generative-ai';
  const client = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  console.log('Gemini configured:', client ? '✅' : '❌');
"

# 5️⃣ تحقق من Stripe
curl https://api.stripe.com/v1/account \
  -H "Authorization: Bearer $STRIPE_SECRET_KEY"
```

---

## 🚨 مشاكل شائعة وحلولها

### ❌ `verifyAuth is not defined`
**السبب**: متغيرات Firebase غير مكوّنة  
**الحل**: تأكد من وجود جميع متغيرات Firebase في `.env.local`

### ❌ `Supabase not fully configured`
**السبب**: متغيرات Supabase ناقصة  
**الحل**: تحقق من `NEXT_PUBLIC_SUPABASE_URL` و `SUPABASE_SERVICE_ROLE_KEY`

### ❌ `GEMINI_NOT_CONFIGURED`
**السبب**: `GOOGLE_API_KEY` غير موجود أو فارغ  
**الحل**: أضف `GOOGLE_API_KEY` من https://aistudio.google.com/apikey

### ❌ `OpenRouter Rate Limit`
**السبب**: API key صحيح لكن الحساب بدون أرصدة  
**الحل**: أضف أرصدة إلى حسابك في https://openrouter.ai/account/billing/limits

### ❌ `FIREBASE_INIT_ERROR: Firebase initialization failed`
**السبب**: `FIREBASE_PRIVATE_KEY` غير صحيحة (خاصة الأسطر الجديدة)  
**الحل**: تأكد أن المفتاح يحتوي على `\n` الفعلية وليس جزء من النص الحرفي

---

## 🔒 أفضل الممارسات الأمنية

### 1️⃣ لا تضع المتغيرات الحساسة في الـ Repo
```bash
# ✅ صحيح - في .gitignore
.env.local
.env.*.local
.env

# ❌ خطأ - لا تضعها هنا
.env.local مُرفوع للـ git
FIREBASE_PRIVATE_KEY في الكود
```

### 2️⃣ استخدم المتغيرات الآمنة للـ Public
```env
# ✅ آمن - معروض للـ Frontend
NEXT_PUBLIC_FIREBASE_API_KEY=...

# ❌ غير آمن - أسرار الخادم فقط
FIREBASE_PRIVATE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 3️⃣ دوّر المفاتيح بشكل دوري
- غيّر `INTEGRATION_TOKEN_SECRET` كل 3-6 أشهر
- استخدم أدوات مثل 1Password أو HashiCorp Vault
- سجّل جميع التغييرات في audit log

---

## 📱 متغيرات محلية للتطوير

للتطوير المحلي فقط (لا تستخدمها في الإنتاج):

```env
# التطوير المحلي
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_GATEWAY_URL=http://localhost:3010
NEXT_PUBLIC_ENABLE_GOOGLE_SIGNIN=true

# Stripe Test Mode
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...

# Integration Test
INTEGRATION_TOKEN_SECRET=test-secret-min-32-chars-required!!
```

---

## 🚀 نصائح التوزيع

### Vercel / Netlify
1. انسخ جميع المتغيرات من الجدول أعلاه
2. ضعها في إعدادات البيئة Environment Variables
3. تأكد من عدم تضمين `.env.local` في الـ Git

### Docker
```dockerfile
# استخدم ARG و ENV معاً
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
```

### GitHub Secrets
```yaml
- name: Deploy
  env:
    FIREBASE_PRIVATE_KEY: ${{ secrets.FIREBASE_PRIVATE_KEY }}
    STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
  run: npm run build
```

---

## ✨ المراجع السريعة

| الخدمة | الرابط | الملاحظات |
|--------|--------|----------|
| Firebase | https://firebase.google.com/console | إنشاء مشروع جديد |
| Supabase | https://supabase.com/dashboard | قاعدة البيانات |
| OpenRouter | https://openrouter.ai/keys | نماذج AI |
| Gemini | https://aistudio.google.com/apikey | بحث مباشر + Free tier |
| Stripe | https://dashboard.stripe.com | الفواتير والدفع |

---

**آخر تحديث**: April 10, 2026  
**الإصدار**: 1.0  
**الحالة**: ✅ مستقر
