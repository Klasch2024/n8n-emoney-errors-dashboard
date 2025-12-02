import { NextRequest, NextResponse } from 'next/server';

// Test endpoint to verify n8n API connection
export async function GET(request: NextRequest) {
  const N8N_API_KEY = process.env.N8N_API_KEY;
  const N8N_BASE_URL = process.env.N8N_BASE_URL || 'https://n8n.srv1023747.hstgr.cloud';

  return NextResponse.json({
    configured: {
      hasApiKey: !!N8N_API_KEY,
      baseUrl: N8N_BASE_URL,
      apiKeyPreview: N8N_API_KEY ? `${N8N_API_KEY.substring(0, 10)}...` : 'NOT SET',
    },
    testUrl: `${N8N_BASE_URL}/api/v1/workflows`,
    instructions: 'Add N8N_API_KEY to your .env.local file',
  });
}

