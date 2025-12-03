import { NextResponse } from 'next/server';
import { fetchUsers } from '@/lib/close';

export async function GET() {
  try {
    const users = await fetchUsers();
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error('[API] Error fetching users:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

