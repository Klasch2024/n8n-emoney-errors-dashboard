import { NextRequest, NextResponse } from 'next/server';
import { errorStore } from '@/lib/errorStore';

// GET endpoint to retrieve all errors
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    const fixed = searchParams.get('fixed'); // Filter by fixed status

    let allErrors = await errorStore.getAllErrors();
    
    // Filter by fixed status if provided
    if (fixed !== null) {
      const isFixed = fixed === 'true';
      allErrors = allErrors.filter((error) => error.resolved === isFixed);
    }
    
    // Debug logging
    console.log(`[API] Fetched ${allErrors.length} errors from Supabase (fixed=${fixed})`);
    if (allErrors.length > 0) {
      console.log(`[API] First error:`, {
        id: allErrors[0].id,
        workflowName: allErrors[0].workflowName,
        timestamp: allErrors[0].timestamp,
        timestampISO: allErrors[0].timestamp.toISOString(),
        resolved: allErrors[0].resolved,
      });
    }
    
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

    console.log('[API] PATCH request received:', { id, updates });

    if (!id) {
      console.error('[API] No ID provided in request');
      return NextResponse.json(
        { success: false, error: 'Error ID is required' },
        { status: 400 }
      );
    }

    console.log('[API] Calling errorStore.updateError...');
    const success = await errorStore.updateError(id, updates);
    console.log('[API] errorStore.updateError returned:', success);

    if (!success) {
      console.error('[API] Update failed - errorStore returned false for ID:', id);
      console.error('[API] This could mean:');
      console.error('[API] 1. The record was not found in Supabase');
      console.error('[API] 2. The Fixed field does not exist in Supabase');
      console.error('[API] 3. The Supabase API returned an error');
      console.error('[API] 4. There was a network or permission issue');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error not found or update failed', 
          message: 'The error may not exist in Supabase, the Fixed field may be missing, or there was an API error. Check server logs for details.' 
        },
        { status: 404 }
      );
    }

    console.log('[API] Successfully updated error:', id);
    return NextResponse.json({
      success: true,
      message: 'Error updated successfully',
    });
  } catch (error) {
    console.error('[API] Exception caught while updating error:', error);
    if (error instanceof Error) {
      console.error('[API] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
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

