type IntegrationTokenResponse = {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  projectKey: string;
};

type IntegrationEntitlementsResponse = {
  userId: string;
  plan: 'free' | 'pro';
  entitlements: Array<{
    service_key: string;
    status: string;
    current_period_end: string | null;
  }>;
  source: 'service_entitlements';
  issuedToProject: string;
};

export async function getIntegrationAccessToken(baseUrl: string, projectKey: string, projectSecret: string): Promise<string> {
  const res = await fetch(`${baseUrl}/api/integration/token`, {
    method: 'POST',
    headers: {
      'x-project-key': projectKey,
      'x-project-secret': projectSecret,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token request failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as IntegrationTokenResponse;
  return data.accessToken;
}

export async function getEntitlementsForUser(
  baseUrl: string,
  accessToken: string,
  userId: string
): Promise<IntegrationEntitlementsResponse> {
  const res = await fetch(`${baseUrl}/api/integration/entitlements?userId=${encodeURIComponent(userId)}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Entitlements request failed (${res.status}): ${text}`);
  }

  return (await res.json()) as IntegrationEntitlementsResponse;
}

