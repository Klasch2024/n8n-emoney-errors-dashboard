import { NextRequest, NextResponse } from 'next/server';
import * as n8n from '@/lib/n8n';

// GET endpoint to retrieve all workflows
export async function GET(request: NextRequest) {
  try {
    console.log('[API] Fetching workflows from n8n...');
    const workflows = await n8n.fetchAllWorkflows();
    
    console.log(`[API] Fetched ${workflows.length} workflows`);
    
    return NextResponse.json({
      workflows,
      total: workflows.length,
    });
  } catch (error) {
    console.error('[API] Error fetching workflows:', error);
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

