import { supabaseAdmin } from '@/lib/supabase';
import { planFromEntitlements, planFromPlanRow } from '@/lib/plan';

export type NormalizedPlan = 'free' | 'pro';

const GEMINI_FREE_LIMIT = 3; // عدد محاولات يومية مجانية
const GEMINI_ATTEMPTS_TABLE = 'gemini_attempts';

/**
 * الحصول على خطة المستخدم من Supabase بشكل موثوق
 */
export async function getUserPlan(uid: string, email?: string | null): Promise<NormalizedPlan> {
  try {
    // 1. القائمة الكاملة للجداول المحتملة
    const tableCandidates = ['user_plans', 'plans', 'plan', 'user_limits', 'service_entitlements'];
    
    // 2. القائمة الكاملة للأعمدة المحتملة للبحث
    const columns = ['user_id', 'uid', 'userId'];
    const emailColumns = ['email', 'user_email', 'email_address', 'mail'];

    for (const table of tableCandidates) {
      try {
        // بناء جملة الاستعلام لكل جدول
        let query = supabaseAdmin.from(table).select('*');
        
        // بناء شروط البحث (UID)
        const uidConditions = columns.map(col => `${col}.eq.${uid}`).join(',');
        
        // إذا كان الإيميل متوفر، نضيفه لشروط البحث
        let finalFilter = uidConditions;
        if (email) {
          const emailConditions = emailColumns.map(col => `${col}.eq.${email}`).join(',');
          finalFilter = `${uidConditions},${emailConditions}`;
        }

        const { data, error } = await query
          .or(finalFilter)
          .order('updated_at', { ascending: false })
          .limit(1);

        if (!error && Array.isArray(data) && data.length > 0) {
          const row = data[0];
          
          // إذا وجدنا استحقاقات مباشرة (لجدول service_entitlements)
          if (table === 'service_entitlements' || Array.isArray(row?.entitlements)) {
            const ents = Array.isArray(row?.entitlements) ? row.entitlements : data;
            return planFromEntitlements(ents);
          }
          
          // وإلا استخدم دالة التحقق العادية
          return planFromPlanRow(row);
        }
      } catch (err) {
        // تابع للجدول التالي في حالة تعثر جدول معين
      }
    }

    return 'free';
  } catch (error) {
    console.error('Error getting user plan:', error);
    return 'free';
  }
}

/**
 * الحصول على عدد محاولات Gemini المستخدمة اليوم
 */
export async function getGeminiAttemptsToday(uid: string): Promise<number> {
  try {
    // الحصول على عدد المحاولات منذ بداية اليوم
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const { count, error } = await supabaseAdmin
      .from(GEMINI_ATTEMPTS_TABLE)
      .select('id', { count: 'exact', head: true })
      .eq('user_id', uid)
      .gte('created_at', startOfDay.toISOString());

    if (error) {
      console.error('Error counting attempts:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getGeminiAttemptsToday:', error);
    return 0;
  }
}

/**
 * تسجيل محاولة Gemini جديدة
 */
export async function recordGeminiAttempt(uid: string): Promise<void> {
  try {
    await supabaseAdmin.from(GEMINI_ATTEMPTS_TABLE).insert({
      user_id: uid,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error recording attempt:', error);
  }
}

/**
 * التحقق من إمكانية استخدام Gemini
 * ترجع { allowed: boolean, reason?: string }
 */
export async function canUseGemini(
  uid: string
): Promise<{ allowed: boolean; reason?: string; attemptsUsed?: number; attemptsLimit?: number }> {
  try {
    // احصل على خطة المستخدم
    const plan = await getUserPlan(uid);

    // Pro users لا توجد حدود
    if (plan === 'pro') {
      return { allowed: true };
    }

    // Free users لديهم حد 5 محاولات
    if (plan === 'free') {
      const attempts = await getGeminiAttemptsToday(uid);

      if (attempts >= GEMINI_FREE_LIMIT) {
        return {
          allowed: false,
          reason: 'GEMINI_FREE_LIMIT_EXCEEDED',
          attemptsUsed: attempts,
          attemptsLimit: GEMINI_FREE_LIMIT,
        };
      }

      return { allowed: true, attemptsUsed: attempts, attemptsLimit: GEMINI_FREE_LIMIT };
    }

    return { allowed: false, reason: 'UNKNOWN_PLAN' };
  } catch (error) {
    console.error('Error in canUseGemini:', error);
    // في حالة الخطأ، اسمح للـ pro users فقط
    return { allowed: false, reason: 'ERROR_CHECKING_PLAN' };
  }
}
