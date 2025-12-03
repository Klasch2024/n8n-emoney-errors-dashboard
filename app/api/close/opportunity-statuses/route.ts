import { NextResponse } from 'next/server';
import { fetchOpportunityStatuses } from '@/lib/close';

export async function GET() {
  try {
    const statuses = await fetchOpportunityStatuses();
    return NextResponse.json({ success: true, data: statuses });
  } catch (error) {
    console.error('[API] Error fetching opportunity statuses:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

