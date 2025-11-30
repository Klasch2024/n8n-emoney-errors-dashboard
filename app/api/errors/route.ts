import { NextRequest, NextResponse } from 'next/server';
import { errorStore } from '@/lib/errorStore';

// GET endpoint to retrieve all errors
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    const allErrors = errorStore.getAllErrors();
    
    const start = offset ? parseInt(offset, 10) : 0;
    const end = limit ? start + parseInt(limit, 10) : allErrors.length;
    
    const errors = allErrors.slice(start, end);

    return NextResponse.json({
      errors,
      total: allErrors.length,
      limit: limit ? parseInt(limit, 10) : allErrors.length,
      offset: start,
    });
  } catch (error) {
    console.error('Error fetching errors:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch errors',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PATCH endpoint to update an error (e.g., mark as resolved)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Error ID is required' },
        { status: 400 }
      );
    }

    const success = errorStore.updateError(id, updates);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Error not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Error updated successfully',
    });
  } catch (error) {
    console.error('Error updating error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

