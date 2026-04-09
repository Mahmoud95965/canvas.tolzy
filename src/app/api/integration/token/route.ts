import { NextRequest, NextResponse } from 'next/server';
import { authenticateProject, issueIntegrationToken } from '@/lib/integration-auth';

const ACCESS_TOKEN_TTL_SECONDS = 300;

export async function POST(req: NextRequest) {
  try {
    const projectKey = req.headers.get('x-project-key');
    const projectSecret = req.headers.get('x-project-secret');
    const project = authenticateProject(projectKey, projectSecret);

    if (!project) {
      return NextResponse.json({ error: 'Unauthorized project' }, { status: 401 });
    }

    const { token, expiresIn } = issueIntegrationToken(project.key, ACCESS_TOKEN_TTL_SECONDS);
    return NextResponse.json({
      accessToken: token,
      tokenType: 'Bearer',
      expiresIn,
      projectKey: project.key,
    });
  } catch (error: any) {
    console.error('Integration token error:', error);
    return NextResponse.json({ error: 'Failed to issue access token' }, { status: 500 });
  }
}

