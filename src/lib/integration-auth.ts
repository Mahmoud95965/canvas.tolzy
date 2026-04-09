import crypto from 'crypto';

type IntegrationProject = {
  key: string;
  secret: string;
  name?: string;
};

type IntegrationTokenPayload = {
  projectKey: string;
  exp: number;
};

const DEFAULT_TTL_SECONDS = 300;

function getProjectsFromEnv(): IntegrationProject[] {
  const raw = process.env.INTEGRATION_PROJECTS_JSON;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((item) => item?.key && item?.secret)
          .map((item) => ({
            key: String(item.key),
            secret: String(item.secret),
            name: item?.name ? String(item.name) : undefined,
          }));
      }
    } catch {
      // Ignore invalid JSON and fallback to single-project env vars.
    }
  }

  const singleKey = process.env.INTEGRATION_PROJECT_KEY;
  const singleSecret = process.env.INTEGRATION_PROJECT_SECRET;
  if (!singleKey || !singleSecret) return [];
  return [{ key: singleKey, secret: singleSecret }];
}

function getTokenSecret(): string | null {
  return process.env.INTEGRATION_TOKEN_SECRET || null;
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function signTokenPayload(payloadEncoded: string): string {
  const tokenSecret = getTokenSecret();
  if (!tokenSecret) throw new Error('Missing INTEGRATION_TOKEN_SECRET');
  return b64url(crypto.createHmac('sha256', tokenSecret).update(payloadEncoded).digest());
}

export function authenticateProject(projectKey?: string | null, projectSecret?: string | null): IntegrationProject | null {
  if (!projectKey || !projectSecret) return null;
  const projects = getProjectsFromEnv();
  return projects.find((project) => project.key === projectKey && project.secret === projectSecret) || null;
}

export function issueIntegrationToken(projectKey: string, ttlSeconds = DEFAULT_TTL_SECONDS): { token: string; expiresIn: number } {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + ttlSeconds;
  const payload: IntegrationTokenPayload = { projectKey, exp };
  const payloadEncoded = b64url(JSON.stringify(payload));
  const signature = signTokenPayload(payloadEncoded);
  return {
    token: `${payloadEncoded}.${signature}`,
    expiresIn: ttlSeconds,
  };
}

export function verifyIntegrationToken(token?: string | null): IntegrationTokenPayload | null {
  if (!token) return null;
  const [payloadEncoded, providedSignature] = token.split('.');
  if (!payloadEncoded || !providedSignature) return null;

  const expectedSignature = signTokenPayload(payloadEncoded);
  const isValidSignature = crypto.timingSafeEqual(Buffer.from(providedSignature), Buffer.from(expectedSignature));
  if (!isValidSignature) return null;

  try {
    const payload = JSON.parse(Buffer.from(payloadEncoded, 'base64').toString('utf-8')) as IntegrationTokenPayload;
    if (!payload?.projectKey || !payload?.exp) return null;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) return null;
    return payload;
  } catch {
    return null;
  }
}

