/** Default when OPENROUTER_*_MODEL env vars are unset */
export const OPENROUTER_DEFAULT_MODEL = 'google/gemma-4-31b-it:free';

/** Shown when upstream is rate-limited or overloaded after retries */
export const UPSTREAM_CONGESTION_USER_MESSAGE_AR =
  'حاول مرة أخرى بسبب الضغط على السيرفر.';

const OPENROUTER_COMPLETIONS_URL = 'https://openrouter.ai/api/v1/chat/completions';

const RETRY_DELAYS_MS = [0, 1500, 3500, 7000];
const MAX_ATTEMPTS = 4;

function openRouterHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://tolzy.me',
    'X-Title': 'Tolzy Flow',
  };
}

/** True when we should retry or tell the user the service is busy (429, 503, overload wording). */
export function isOpenRouterRateLimited(httpStatus: number, bodyText: string): boolean {
  if (httpStatus === 429 || httpStatus === 503 || httpStatus === 502) return true;
  try {
    const j = JSON.parse(bodyText) as { error?: { code?: number; message?: string } };
    const code = j?.error?.code;
    if (code === 429 || code === 503 || code === 502) return true;
    const m = String(j?.error?.message || '').toLowerCase();
    if (m.includes('rate') && (m.includes('limit') || m.includes('limited'))) return true;
    if (
      m.includes('overloaded') ||
      m.includes('overload') ||
      m.includes('capacity') ||
      m.includes('unavailable') ||
      m.includes('too many requests') ||
      m.includes('temporarily') ||
      m.includes('try again')
    ) {
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * POST /chat/completions with retries on upstream congestion (429, 503, overload messages).
 * On success returns the Response with an unread body (stream or JSON).
 */
export async function openRouterPostChatCompletionsWithRetry(
  apiKey: string,
  body: Record<string, unknown>,
  options?: { perAttemptTimeoutMs?: number }
): Promise<Response> {
  const timeoutMs = options?.perAttemptTimeoutMs ?? 55_000;
  let lastErrorText = '';
  let lastStatus = 0;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    if (attempt > 0) {
      await sleep(RETRY_DELAYS_MS[attempt] ?? 2000);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(OPENROUTER_COMPLETIONS_URL, {
        method: 'POST',
        headers: openRouterHeaders(apiKey),
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (res.ok) {
        return res;
      }

      const text = await res.text();
      lastErrorText = text;
      lastStatus = res.status;

      if (isOpenRouterRateLimited(res.status, text) && attempt < MAX_ATTEMPTS - 1) {
        console.warn(`[OpenRouter] busy/upstream limit (attempt ${attempt + 1}/${MAX_ATTEMPTS}), retrying…`);
        continue;
      }

      if (isOpenRouterRateLimited(res.status, text)) {
        throw new Error('OPENROUTER_RATE_LIMIT');
      }

      throw new Error(`OpenRouter error: ${text}`);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new Error(lastErrorText || `OpenRouter error: HTTP ${lastStatus}`);
}

/** Non-streaming completion: parses JSON and returns assistant text. */
export async function fetchOpenRouterChatCompletionText(
  apiKey: string,
  model: string,
  messages: Array<{ role: string; content: string }>,
  maxTokens: number,
  temperature = 0.2
): Promise<string> {
  const res = await openRouterPostChatCompletionsWithRetry(apiKey, {
    model,
    messages,
    stream: false,
    temperature,
    max_tokens: maxTokens,
  });
  const json: unknown = await res.json();
  const out = extractAssistantText(json);
  if (!out) throw new Error('OpenRouter empty completion');
  return out;
}

/** Parse assistant text from OpenRouter/OpenAI-style chat completion JSON */
export function extractAssistantText(payload: unknown): string {
  const p = payload as {
    choices?: Array<{
      message?: { content?: unknown };
      delta?: { content?: unknown };
    }>;
  };
  const content = p?.choices?.[0]?.message?.content;
  if (typeof content === 'string') return content;

  if (Array.isArray(content)) {
    return content
      .map((part: unknown) => {
        if (typeof part === 'string') return part;
        if (part && typeof part === 'object' && 'text' in part && typeof (part as { text?: unknown }).text === 'string') {
          return (part as { text: string }).text;
        }
        return '';
      })
      .join('')
      .trim();
  }

  const deltaContent = p?.choices?.[0]?.delta?.content;
  if (typeof deltaContent === 'string') return deltaContent;

  return '';
}
