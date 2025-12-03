import { NextResponse } from 'next/server';
import { fetchOpportunityCustomFields } from '@/lib/close';

export async function GET() {
  try {
    const customFields = await fetchOpportunityCustomFields();
    return NextResponse.json({ success: true, data: customFields });
  } catch (error) {
    console.error('[API] Error fetching opportunity custom fields:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

