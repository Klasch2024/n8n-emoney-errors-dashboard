import { createClient } from '@supabase/supabase-js';
import { WorkflowError } from '@/types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if ((!SUPABASE_URL || !SUPABASE_ANON_KEY) && process.env.NODE_ENV === 'development') {
  console.warn('[Supabase] ⚠️ Configuration missing. Some features may not work.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Map WorkflowError to Supabase row format
function errorToSupabaseRow(error: WorkflowError): any {
  return {
    execution_id: error.executionId,
    execution_url: error.outputData?.executionUrl || null,
    workflow_id: error.workflowId,
    workflow_name: error.workflowName,
    node_name: error.nodeName,
    error_message: error.errorMessage,
    error_level: (error as any).errorLevel || (error.severity === 'critical' ? 'error' : error.severity || 'warning'),
    error_type: error.errorType,
    node_type: (error as any).nodeType || null,
    stack_trace: error.stackTrace || null,
    timestamp: error.timestamp.toISOString(),
    resolved: error.resolved,
    fixed: error.resolved ? 'TRUE' : 'FALSE', // Text field: TRUE/FALSE
  };
}

// Map Supabase row to WorkflowError
function supabaseRowToError(row: any): WorkflowError {
  // Handle fixed field - can be text ('TRUE'/'FALSE') or boolean
  let resolved = false;
  if (row.fixed !== undefined && row.fixed !== null && row.fixed !== '') {
    if (typeof row.fixed === 'string') {
      resolved = row.fixed.toUpperCase() === 'TRUE';
    } else {
      resolved = Boolean(row.fixed);
    }
  } else {
    // Fall back to resolved field
    resolved = row.resolved || false;
  }

  return {
    id: row.id, // Use Supabase UUID as the primary ID
    workflowId: row.workflow_id || '',
    workflowName: row.workflow_name || '',
    nodeName: row.node_name || 'Unknown Node',
    errorMessage: row.error_message || '',
    errorType: row.error_type || 'other',
    severity: row.error_level === 'error' ? 'critical' : (row.error_level || 'medium'),
    timestamp: row.timestamp ? new Date(row.timestamp) : new Date(),
    executionId: row.execution_id || '',
    retryCount: 0, // Not in simplified schema
    resolved: resolved,
    stackTrace: row.stack_trace,
    inputData: undefined, // Not in simplified schema
    outputData: {
      executionUrl: row.execution_url || undefined,
    },
  };
}

// Fetch all errors from Supabase
export async function fetchAllErrors(): Promise<WorkflowError[]> {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Supabase] Fetching all errors...');
    }
    
    const { data, error } = await supabase
      .from('workflow_errors')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('[Supabase] Error fetching errors:', error);
      throw error;
    }

    if (!data) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Supabase] No errors found');
      }
      return [];
    }

    const errors = data.map(supabaseRowToError);
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Supabase] ✅ Fetched ${errors.length} errors`);
      if (errors.length > 0) {
        console.log(`[Supabase] First error:`, {
          id: errors[0].id,
          workflowName: errors[0].workflowName,
          resolved: errors[0].resolved,
        });
      }
    }

    return errors;
  } catch (error) {
    console.error('[Supabase] Exception fetching errors:', error);
    throw error;
  }
}

// Create a new error in Supabase
export async function createError(error: WorkflowError): Promise<WorkflowError> {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Supabase] Creating error:', error.id);
    }
    
    const row = errorToSupabaseRow(error);
    
    const { data, error: insertError } = await supabase
      .from('workflow_errors')
      .insert(row)
      .select()
      .single();

    if (insertError) {
      console.error('[Supabase] Error creating error:', insertError);
      throw insertError;
    }

    if (!data) {
      console.error('[Supabase] No data returned after insert');
      return error;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[Supabase] ✅ Error created successfully');
    }
    return supabaseRowToError(data);
  } catch (error) {
    console.error('[Supabase] Exception creating error:', error);
    throw error;
  }
}

// Update an existing error in Supabase
export async function updateError(id: string, updates: Partial<WorkflowError>): Promise<boolean> {
  try {
    console.log('[Supabase] ========== UPDATE ERROR CALLED ==========');
    console.log('[Supabase] ID:', id);
    console.log('[Supabase] Updates:', JSON.stringify(updates, null, 2));

    const updateData: any = {};

    // Map updates to Supabase column names
    if (updates.resolved !== undefined) {
      updateData.resolved = updates.resolved;
      updateData.fixed = updates.resolved ? 'TRUE' : 'FALSE'; // Update Fixed field (text: TRUE/FALSE)
    }
    if (updates.executionId !== undefined) updateData.execution_id = updates.executionId;
    if (updates.workflowId !== undefined) updateData.workflow_id = updates.workflowId;
    if (updates.workflowName !== undefined) updateData.workflow_name = updates.workflowName;
    if (updates.nodeName !== undefined) updateData.node_name = updates.nodeName;
    if (updates.errorMessage !== undefined) updateData.error_message = updates.errorMessage;
    if (updates.errorType !== undefined) updateData.error_type = updates.errorType;
    if (updates.timestamp !== undefined) updateData.timestamp = updates.timestamp.toISOString();
    if (updates.stackTrace !== undefined) updateData.stack_trace = updates.stackTrace;
    // Handle executionUrl from outputData
    if (updates.outputData?.executionUrl !== undefined) {
      updateData.execution_url = updates.outputData.executionUrl;
    }
    // Handle extended fields if they exist
    const extendedUpdates = updates as any;
    if (extendedUpdates.errorLevel !== undefined) updateData.error_level = extendedUpdates.errorLevel;
    if (extendedUpdates.nodeType !== undefined) updateData.node_type = extendedUpdates.nodeType;

    if (process.env.NODE_ENV === 'development') {
      console.log('[Supabase] Updating record with ID:', id);
      console.log('[Supabase] Update data:', JSON.stringify(updateData, null, 2));
      console.log('[Supabase] Fixed field value:', updateData.fixed);
    }

    const { data, error } = await supabase
      .from('workflow_errors')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Supabase] ❌ Update failed:', error);
      console.error('[Supabase] Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return false;
    }

    if (!data) {
      console.error('[Supabase] ❌ No data returned after update');
      return false;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[Supabase] ✅ Successfully updated record:', id);
      console.log('[Supabase] Updated record:', JSON.stringify(data, null, 2));
    }
    
    // Verify the Fixed field was actually updated
    if (data.fixed !== undefined) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Supabase] ✅ Fixed field value after update:', data.fixed);
        if (data.fixed === 'TRUE') {
          console.log('[Supabase] ✅✅✅ Fixed field successfully set to TRUE!');
        } else {
          console.warn('[Supabase] ⚠️ Fixed field value is not TRUE:', data.fixed);
        }
      }
    } else if (process.env.NODE_ENV === 'development') {
      console.error('[Supabase] ❌ ERROR: Fixed field not found in response!');
    }

    return true;
  } catch (error) {
    console.error('[Supabase] ❌❌❌ EXCEPTION caught while updating:', error);
    if (error instanceof Error) {
      console.error('[Supabase] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
    return false;
  }
}

// Delete an error from Supabase
export async function deleteError(id: string): Promise<boolean> {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Supabase] Deleting error:', id);
    }
    
    const { error } = await supabase
      .from('workflow_errors')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Supabase] Error deleting error:', error);
      return false;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[Supabase] ✅ Error deleted successfully');
    }
    return true;
  } catch (error) {
    console.error('[Supabase] Exception deleting error:', error);
    return false;
  }
}

