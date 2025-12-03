import { NextResponse } from 'next/server';
import { fetchLeadCustomFields } from '@/lib/close';

export async function GET() {
  try {
    const customFields = await fetchLeadCustomFields();
    return NextResponse.json({ success: true, data: customFields });
  } catch (error) {
    console.error('[API] Error fetching custom fields:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

