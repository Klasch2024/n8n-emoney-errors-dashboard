import { WorkflowError, ErrorAnalytics } from '@/types';

const workflowNames = [
  'Email Notification System',
  'Data Sync Pipeline',
  'API Integration',
  'Report Generator',
  'User Onboarding',
  'Payment Processor',
  'Inventory Manager',
  'Customer Support',
  'Analytics Aggregator',
  'Backup Service',
];

const nodeNames = [
  'HTTP Request',
  'Database Query',
  'Email Send',
  'Data Transform',
  'Webhook Trigger',
  'File Upload',
  'API Call',
  'Data Validation',
  'Conditional Logic',
  'Error Handler',
];

const errorMessages = [
  'Connection timeout after 30 seconds',
  'Invalid response format from API',
  'Database connection pool exhausted',
  'Authentication token expired',
  'Rate limit exceeded: 100 requests per minute',
  'Missing required field: userId',
  'File not found: /path/to/resource',
  'Network error: ECONNREFUSED',
  'Validation failed: email format invalid',
  'Memory limit exceeded: 512MB',
  'SSL certificate verification failed',
  'JSON parsing error: unexpected token',
  'Timeout waiting for response',
  'Invalid credentials provided',
  'Resource not available',
];

const errorTypes: Array<'timeout' | 'connection' | 'validation' | 'runtime' | 'other'> = [
  'timeout',
  'connection',
  'validation',
  'runtime',
  'other',
];

const severities: Array<'critical' | 'high' | 'medium' | 'low'> = [
  'critical',
  'high',
  'medium',
  'low',
];

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

export function generateMockErrors(count: number = 75): WorkflowError[] {
  const errors: WorkflowError[] = [];
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < count; i++) {
    const timestamp = randomDate(thirtyDaysAgo, now);
    const workflowName = randomElement(workflowNames);
    const errorType = randomElement(errorTypes);
    const severity = randomElement(severities);

    errors.push({
      id: `error-${i + 1}`,
      workflowId: `workflow-${Math.floor(Math.random() * 10) + 1}`,
      workflowName,
      nodeName: randomElement(nodeNames),
      errorMessage: randomElement(errorMessages),
      errorType,
      severity,
      timestamp,
      executionId: `exec-${Math.random().toString(36).substring(2, 15)}`,
      retryCount: Math.floor(Math.random() * 5),
      stackTrace: Math.random() > 0.5
        ? `Error: ${randomElement(errorMessages)}\n    at ${randomElement(nodeNames)} (line ${Math.floor(Math.random() * 100)})\n    at processWorkflow (workflow.js:${Math.floor(Math.random() * 50)})\n    at executeNode (executor.js:${Math.floor(Math.random() * 30)})`
        : undefined,
      inputData: Math.random() > 0.3
        ? {
            userId: Math.floor(Math.random() * 1000),
            timestamp: timestamp.toISOString(),
            data: { key: 'value', count: Math.floor(Math.random() * 100) },
          }
        : undefined,
      outputData: Math.random() > 0.3
        ? {
            status: 'error',
            code: Math.floor(Math.random() * 500) + 400,
            message: randomElement(errorMessages),
          }
        : undefined,
      resolved: Math.random() > 0.7,
    });
  }

  return errors.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function generateMockAnalytics(errors: WorkflowError[]): ErrorAnalytics {
  const now = new Date();
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const recentErrors = errors.filter((e) => e.timestamp >= last24Hours);
  const previousPeriodErrors = errors.filter(
    (e) => e.timestamp >= new Date(now.getTime() - 48 * 60 * 60 * 1000) && e.timestamp < last24Hours
  );

  const totalErrors = errors.length;
  const errorRate = recentErrors.length;
  const previousErrorRate = previousPeriodErrors.length;
  const errorRateChange = previousErrorRate > 0
    ? ((errorRate - previousErrorRate) / previousErrorRate) * 100
    : 0;

  // Most affected workflow
  const workflowCounts = errors.reduce((acc, error) => {
    acc[error.workflowName] = (acc[error.workflowName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostAffectedWorkflow = Object.entries(workflowCounts).sort(
    ([, a], [, b]) => b - a
  )[0]?.[0] || 'N/A';

  // Errors by type
  const errorsByType = errors.reduce((acc, error) => {
    acc[error.errorType] = (acc[error.errorType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Trends (last 7 days)
  const trends = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const dayEnd = new Date(date.setHours(23, 59, 59, 999));
    const count = errors.filter(
      (e) => e.timestamp >= dayStart && e.timestamp <= dayEnd
    ).length;
    trends.push({ timestamp: dayStart, count });
  }

  // Top workflows
  const topWorkflows = Object.entries(workflowCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([workflowName, errorCount]) => {
      const workflowErrors = errors.filter((e) => e.workflowName === workflowName);
      const lastError = workflowErrors[0]?.timestamp || new Date();
      const totalExecutions = workflowErrors.length + Math.floor(Math.random() * 50);
      const successRate = ((totalExecutions - errorCount) / totalExecutions) * 100;
      const avgDuration = Math.floor(Math.random() * 5000) + 1000; // ms

      return {
        workflowName,
        errorCount,
        lastError,
        successRate: Math.max(0, Math.min(100, successRate)),
        avgDuration,
      };
    });

  return {
    totalErrors,
    errorRate,
    mostAffectedWorkflow,
    avgResolutionTime: Math.floor(Math.random() * 3600) + 300, // seconds
    trends,
    errorsByType: Object.entries(errorsByType).map(([type, count]) => ({
      type,
      count,
    })),
    topWorkflows,
  };
}

