import { NextRequest, NextResponse } from 'next/server';
import * as n8n from '@/lib/n8n';

// GET endpoint to retrieve all workflows
export async function GET(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('[API] Fetching workflows from n8n...');
    }
    const workflows = await n8n.fetchAllWorkflows();
    const n8nBaseUrl = process.env.N8N_BASE_URL || '';
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] Fetched ${workflows.length} workflows`);
    }
    
    return NextResponse.json({
      workflows,
      total: workflows.length,
      n8nBaseUrl, // Include base URL for client-side use
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[API] Error fetching workflows:', error);
    }
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch workflows',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

