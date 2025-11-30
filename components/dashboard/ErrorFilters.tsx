'use client';

import React from 'react';
import { SearchInput } from '../ui/Input';
import { Select } from '../ui/Select';
import { ErrorSeverity, ErrorType, TimeRange, WorkflowStatus } from '@/types';

interface ErrorFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  severity: ErrorSeverity | 'all';
  onSeverityChange: (severity: ErrorSeverity | 'all') => void;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  workflowStatus: WorkflowStatus;
  onWorkflowStatusChange: (status: WorkflowStatus) => void;
  errorType: ErrorType | 'all';
  onErrorTypeChange: (type: ErrorType | 'all') => void;
}

export const ErrorFilters: React.FC<ErrorFiltersProps> = ({
  searchQuery,
  onSearchChange,
  severity,
  onSeverityChange,
  timeRange,
  onTimeRangeChange,
  workflowStatus,
  onWorkflowStatusChange,
  errorType,
  onErrorTypeChange,
}) => {
  return (
    <div className="mb-4 md:mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
        <div className="flex-1">
          <SearchInput
            placeholder="Search by workflow name, error message, or node..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Select
          options={[
            { value: 'all', label: 'All Severities' },
            { value: 'critical', label: 'Critical' },
            { value: 'high', label: 'High' },
            { value: 'medium', label: 'Medium' },
            { value: 'low', label: 'Low' },
          ]}
          value={severity}
          onChange={(e) => onSeverityChange(e.target.value as ErrorSeverity | 'all')}
        />
        <Select
          options={[
            { value: '1h', label: 'Last Hour' },
            { value: '24h', label: '24 Hours' },
            { value: '7d', label: '7 Days' },
            { value: '30d', label: '30 Days' },
            { value: 'custom', label: 'Custom' },
          ]}
          value={timeRange}
          onChange={(e) => onTimeRangeChange(e.target.value as TimeRange)}
        />
        <Select
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'active', label: 'Active' },
            { value: 'paused', label: 'Paused' },
          ]}
          value={workflowStatus}
          onChange={(e) => onWorkflowStatusChange(e.target.value as WorkflowStatus)}
        />
        <Select
          options={[
            { value: 'all', label: 'All Types' },
            { value: 'timeout', label: 'Timeout' },
            { value: 'connection', label: 'Connection' },
            { value: 'validation', label: 'Validation' },
            { value: 'runtime', label: 'Runtime' },
            { value: 'other', label: 'Other' },
          ]}
          value={errorType}
          onChange={(e) => onErrorTypeChange(e.target.value as ErrorType | 'all')}
        />
      </div>
    </div>
  );
};

