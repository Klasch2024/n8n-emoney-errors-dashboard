import { NextRequest, NextResponse } from 'next/server';
import { errorStore } from '@/lib/errorStore';
import { WorkflowError } from '@/types';

// n8n Error Format Interface
interface N8NErrorPayload {
  timestamp?: string;
  workflow?: {
    id: string;
    name: string;
    active?: boolean;
  };
  execution?: {
    id: string;
    url?: string;
    error?: {
      level?: string;
      description?: string;
      message?: string;
      stack?: string;
      node?: {
        name?: string;
        type?: string;
        id?: string;
        parameters?: any;
      };
    };
    lastNodeExecuted?: string;
    mode?: string;
    executionContext?: any;
  };
  error_summary?: {
    workflow_name?: string;
    workflow_id?: string;
    execution_id?: string;
    error_occurred_at?: string;
  };
}

// Map n8n error level to severity
function mapErrorLevelToSeverity(level?: string): 'critical' | 'high' | 'medium' | 'low' {
  if (!level) return 'medium';
  
  const levelLower = level.toLowerCase();
  if (levelLower === 'error' || levelLower === 'critical') return 'critical';
  if (levelLower === 'warning' || levelLower === 'high') return 'high';
  if (levelLower === 'info' || levelLower === 'low') return 'low';
  return 'medium';
}

// Determine error type from error message
function determineErrorType(message?: string, nodeType?: string): 'timeout' | 'connection' | 'validation' | 'runtime' | 'other' {
  if (!message) return 'other';
  
  const messageLower = message.toLowerCase();
  
  if (messageLower.includes('timeout') || messageLower.includes('timed out')) {
    return 'timeout';
  }
  if (messageLower.includes('connection') || messageLower.includes('connect') || messageLower.includes('network')) {
    return 'connection';
  }
  if (messageLower.includes('validation') || messageLower.includes('invalid') || messageLower.includes('permission')) {
    return 'validation';
  }
  if (messageLower.includes('runtime') || messageLower.includes('execution')) {
    return 'runtime';
  }
  
  return 'other';
}

// Transform n8n error format to WorkflowError
function transformN8NError(n8nError: N8NErrorPayload): WorkflowError | null {
  try {
    const workflow = n8nError.workflow;
    const execution = n8nError.execution;
    const error = execution?.error;
    const errorSummary = n8nError.error_summary;
    
    // Need either workflow+execution OR error_summary
    if ((!workflow || !execution) && !errorSummary) {
      return null;
    }

    // Handle case where we have workflow object - use type narrowing
    const workflowId = (workflow && 'id' in workflow ? workflow.id : undefined) || errorSummary?.workflow_id || 'unknown';
    const workflowName = (workflow && 'name' in workflow ? workflow.name : undefined) || errorSummary?.workflow_name || 'Unknown Workflow';
    const executionId = execution?.id || errorSummary?.execution_id || `exec-${Date.now()}`;
    
    // Get node name from error node or last executed node
    const nodeName = error?.node?.name || execution?.lastNodeExecuted || 'Unknown Node';
    
    // Get error message
    const errorMessage = error?.message || error?.description || 'Unknown error occurred';
    
    // Get error level and map to severity
    const severity = mapErrorLevelToSeverity(error?.level);
    
    // Determine error type
    const errorType = determineErrorType(errorMessage, error?.node?.type);
    
    // Get timestamp
    const timestamp = n8nError.timestamp 
      ? new Date(n8nError.timestamp) 
      : (n8nError.error_summary?.error_occurred_at 
          ? new Date(n8nError.error_summary.error_occurred_at) 
          : new Date());

    // Get error level and node type from n8n error
    const errorLevel = error?.level || 'warning';
    const nodeType = error?.node?.type || undefined;

    // Create WorkflowError
    const workflowError: WorkflowError & { errorLevel?: string; nodeType?: string } = {
      id: `error-${executionId}-${Date.now()}`,
      workflowId,
      workflowName,
      nodeName,
      errorMessage,
      errorType,
      severity,
      timestamp,
      executionId,
      retryCount: 0, // n8n doesn't provide retry count in this format
      stackTrace: error?.stack,
      inputData: error?.node?.parameters,
      outputData: {
        executionUrl: execution?.url,
        mode: execution?.mode,
        nodeType: error?.node?.type,
        nodeId: error?.node?.id,
      },
      resolved: false,
      errorLevel, // Add error level for Supabase
      nodeType, // Add node type for Supabase
    };

    return workflowError;
  } catch (err) {
    console.error('Error transforming n8n error:', err);
    return null;
  }
}

// Check if payload is n8n format
function isN8NFormat(data: any): data is N8NErrorPayload {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data.workflow !== undefined || data.error_summary !== undefined) &&
    (data.execution !== undefined || data.error_summary !== undefined)
  );
}

// Validate error payload (original format)
function validateErrorPayload(data: any): data is WorkflowError {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.workflowId === 'string' &&
    typeof data.workflowName === 'string' &&
    typeof data.nodeName === 'string' &&
    typeof data.errorMessage === 'string' &&
    (data.errorType === undefined ||
      ['timeout', 'connection', 'validation', 'runtime', 'other'].includes(data.errorType)) &&
    (data.severity === undefined ||
      ['critical', 'high', 'medium', 'low'].includes(data.severity))
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Handle single error or array of errors
    const errors = Array.isArray(body) ? body : [body];

    // Process all errors
    const validErrors: WorkflowError[] = [];
    const invalidErrors: any[] = [];

    for (const error of errors) {
      let processedError: WorkflowError | null = null;

      // Check if it's n8n format
      if (isN8NFormat(error)) {
        processedError = transformN8NError(error);
      } 
      // Check if it's already in WorkflowError format
      else if (validateErrorPayload(error)) {
        processedError = {
          ...error,
          timestamp: error.timestamp ? new Date(error.timestamp) : new Date(),
        };
      }

      if (processedError) {
        validErrors.push(processedError);
      } else {
        invalidErrors.push(error);
      }
    }

    // Add valid errors to store
    if (validErrors.length > 0) {
      await errorStore.addErrors(validErrors);
    }

    // Return response
    return NextResponse.json(
      {
        success: true,
        received: errors.length,
        processed: validErrors.length,
        rejected: invalidErrors.length,
        message: `Successfully processed ${validErrors.length} error(s)`,
        ...(invalidErrors.length > 0 && {
          rejectedErrors: invalidErrors,
          warning: 'Some errors were rejected due to validation failures',
        }),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid request body',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 }
    );
  }
}

// GET endpoint to retrieve errors (optional, for debugging)
export async function GET() {
  const errors = await errorStore.getAllErrors();
  return NextResponse.json({
    count: errors.length,
    errors: errors.slice(0, 100), // Return first 100 for debugging
  });
}

// DELETE endpoint to clear all errors (optional, for testing)
export async function DELETE() {
  await errorStore.clearAll();
  return NextResponse.json({
    success: true,
    message: 'All errors cleared',
  });
}

