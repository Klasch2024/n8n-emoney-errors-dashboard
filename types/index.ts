export interface WorkflowError {
  id: string;
  workflowId: string;
  workflowName: string;
  nodeName: string;
  errorMessage: string;
  errorType: 'timeout' | 'connection' | 'validation' | 'runtime' | 'other';
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: Date;
  executionId: string;
  retryCount: number;
  stackTrace?: string;
  inputData?: any;
  outputData?: any;
  resolved: boolean;
}

export interface ErrorAnalytics {
  totalErrors: number;
  errorRate: number;
  mostAffectedWorkflow: string;
  avgResolutionTime: number;
  trends: {
    timestamp: Date;
    count: number;
  }[];
  errorsByType: {
    type: string;
    count: number;
  }[];
  topWorkflows: {
    workflowName: string;
    errorCount: number;
    lastError: Date;
    successRate: number;
    avgDuration: number;
  }[];
}

export type ErrorSeverity = 'critical' | 'high' | 'medium' | 'low';
export type ErrorType = 'timeout' | 'connection' | 'validation' | 'runtime' | 'other';
export type TimeRange = '1h' | '24h' | '7d' | '30d' | 'custom';
export type WorkflowStatus = 'active' | 'paused' | 'all';

