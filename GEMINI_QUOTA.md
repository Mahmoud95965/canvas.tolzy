# نظام الحد الأقصى للمحاولات - Gemini Quota System

## 📋 نظرة عامة

تم تطبيق نظام ذكي للتحكم في استخدام Gemini:

| المستخدم | المحاولات | الحد |
|---------|---------|-----|
| 🆓 **Free** | محدود | 5/يوم |
| 💎 **Pro** | غير محدود | ∞ |

---

## 🏗️ البنية التقنية

### الملفات الجديدة

```
src/lib/gemini-quota.ts          → منطق التحقق من الحد
src/app/api/ai/chat/route.ts     → معالج API محدّث
supabase/gemini_attempts.sql     → قاعدة البيانات
```

### الدوال الرئيسية

#### 1. `getUserPlan(uid)`
```typescript
// الحصول على خطة المستخدم
const plan = await getUserPlan(uid);  // 'free' | 'pro'
```

#### 2. `canUseGemini(uid)`
```typescript
// التحقق من إمكانية استخدام Gemini
const quota = await canUseGemini(uid);
if (!quota.allowed) {
  // عرض رسالة الخطأ
  console.log(quota.reason);  // 'GEMINI_FREE_LIMIT_EXCEEDED'
  console.log(quota.attemptsUsed);  // 5
  console.log(quota.attemptsLimit); // 5
}
```

#### 3. `recordGeminiAttempt(uid)`
```typescript
// تسجيل محاولة جديدة بعد الاستخدام الناجح
await recordGeminiAttempt(uid);
```

---

## 🗄️ الإعداد في Supabase

### خطوة 1: تشغيل الـ Migration

انسخ محتويات `supabase/gemini_attempts.sql` واشغله في Supabase SQL Editor:

1. اذهب إلى: https://app.supabase.com/project/YOUR_PROJECT/sql
2. انسخ محتوى الملف
3. اضغط "Run"

### خطوة 2: التحقق من الجدول

```sql
SELECT * FROM gemini_attempts LIMIT 10;
```

---

## 🎯 سلوك النظام

### السيناريو 1: Free User في أول اليوم

```
1. المستخدم يرسل: "كم سعر الدولار؟"
   ✅ استجابة من Gemini (محاولة 1/5)

2. يرسل: "أخبار اليوم"
   ✅ استجابة من Gemini (محاولة 2/5)

... يكرر حتى 5 محاولات ...

6. يرسل: "آخر إصدار React"
   ❌ الرد:
   "آسف! لقد استخدمت 5/5 محاولات Gemini اليوم.
    
    بسبب التكلفة العالية للتشغيل، يمكنك التجربة لاحقاً غداً 
    أو الاشتراك في **Tolzy Pro** للحصول على محاولات غير محدودة."
    
   مع زر: "💎 ترقية إلى Pro الآن"
```

### السيناريو 2: Pro User

```
يرسل 100 محاولة في اليوم ✅
لا توجد قيود أو رسائل خطأ
```

### السيناريو 3: اليوم التالي

```
الحد ينعدّل تلقائياً في منتصف الليل
Free user يحصل على 5 محاولات جديدة ✅
```

---

## 💬 رسالة الخطأ المخصصة

عندما يتجاوز Free user حده:

```json
{
  "error": "GEMINI_QUOTA_EXCEEDED",
  "message": "آسف! لقد استخدمت 5/5 محاولات Gemini اليوم...",
  "attemptsUsed": 5,
  "attemptsLimit": 5,
  "upgradeUrl": "/upgrade"
}
```

---

## 🖥️ في Frontend

### معالجة الخطأ

```typescript
const response = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ provider: 'gemini', messages: [...] })
});

if (!response.ok) {
  const error = await response.json();
  
  if (error.error === 'GEMINI_QUOTA_EXCEEDED') {
    // عرض رسالة مخصصة + زر الترقية
    showQuotaExceededModal({
      message: error.message,
      upgradeUrl: error.upgradeUrl
    });
  }
}
```

---

## 📊 المراقبة

### عرض إحصائيات المحاولات

```sql
-- عدد المحاولات اليوم لكل مستخدم
SELECT 
  user_id, 
  COUNT(*) as attempts_today,
  MAX(created_at) as last_attempt
FROM gemini_attempts
WHERE created_at >= NOW()::date
GROUP BY user_id
ORDER BY attempts_today DESC;

-- أكثر المستخدمين استخداماً
SELECT 
  user_id, 
  DATE(created_at) as date,
  COUNT(*) as daily_attempts
FROM gemini_attempts
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY user_id, DATE(created_at)
ORDER BY daily_attempts DESC
LIMIT 20;
```

---

## 🔧 التخصيص

### تغيير حد المحاولات

في `src/lib/gemini-quota.ts`:

```typescript
// الحالي: 5 محاولات
const GEMINI_FREE_LIMIT = 5;

// غيّر إلى:
const GEMINI_FREE_LIMIT = 10;  // 10 محاولات
```

### تخصيص الرسالة

في `src/app/api/ai/chat/route.ts`:

```typescript
const errorMessage =
  geminiQuota.reason === 'GEMINI_FREE_LIMIT_EXCEEDED'
    ? `رسالتك الخاصة هنا...`  // غيّر هنا
    : 'غير مصرح بـ...';
```

---

## 🐛 معالجة المشاكل

### المشكلة: قاعدة البيانات لا تُظهر الجدول

**الحل:**
```sql
-- التحقق من وجود الجدول
SELECT EXISTS(
  SELECT FROM information_schema.tables 
  WHERE table_name = 'gemini_attempts'
);

-- إذا كانت النتيجة false، شغّل sql file مرة أخرى
```

### المشكلة: جميع المستخدمين يحصلون على خطأ

**الحل:**
```typescript
// تحقق من:
1. GOOGLE_API_KEY في .env.local
2. Supabase connection string
3. أن الجدول موجود وفعال
```

---

## 📈 الخطوات المستقبلية (اختياري)

### 1. لوحة تحكم للمستخدم

```typescript
// عرض الحد المتبقي
<QuotaDisplay attempts={4} limit={5} />
// عرض: "1 محاولة متبقية اليوم"
```

### 2. Notifications

```typescript
// عندما يقترب من الحد
if (attempts === 4) {
  showNotification("محاولة واحدة فقط متبقية!");
}
```

### 3. Trial Period

```typescript
// 7 أيام مجانية بـ unlimited attempts بعد التسجيل
if (daysOld <= 7) {
  return { allowed: true };  // unlimited
}
```

---

## 📞 الدعم

- **أسئلة تقنية**: اقرأ [GEMINI_SETUP.md](./GEMINI_SETUP.md)
- **أمثلة**: اقرأ [GEMINI_QUOTA_EXAMPLE.tsx](./GEMINI_QUOTA_EXAMPLE.tsx)
- **SQL**: شاهد [supabase/gemini_attempts.sql](./supabase/gemini_attempts.sql)
