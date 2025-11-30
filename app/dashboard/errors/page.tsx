'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { WorkflowError, ErrorSeverity, ErrorType, TimeRange, WorkflowStatus } from '@/types';
import { ErrorCard } from '@/components/dashboard/ErrorCard';
import { ErrorFilters } from '@/components/dashboard/ErrorFilters';
import { ErrorDetailsModal } from '@/components/dashboard/ErrorDetailsModal';
import { Button } from '@/components/ui/Button';

export default function ErrorsPage() {
  const [errors, setErrors] = useState<WorkflowError[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchErrors = async () => {
    try {
      const response = await fetch('/api/errors');
      if (response.ok) {
        const data = await response.json();
        setErrors(data.errors || []);
      } else {
        console.error('Failed to fetch errors');
        setErrors([]);
      }
    } catch (error) {
      console.error('Error fetching errors:', error);
      setErrors([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchErrors();
    
    // Poll for new errors every 5 seconds
    const interval = setInterval(fetchErrors, 5000);
    
    return () => clearInterval(interval);
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [severity, setSeverity] = useState<ErrorSeverity | 'all'>('all');
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>('all');
  const [errorType, setErrorType] = useState<ErrorType | 'all'>('all');
  const [selectedError, setSelectedError] = useState<WorkflowError | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredErrors = useMemo(() => {
    let filtered = [...errors];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (error) =>
          error.workflowName.toLowerCase().includes(query) ||
          error.errorMessage.toLowerCase().includes(query) ||
          error.nodeName.toLowerCase().includes(query)
      );
    }

    // Severity filter
    if (severity !== 'all') {
      filtered = filtered.filter((error) => error.severity === severity);
    }

    // Time range filter
    const now = new Date();
    let timeThreshold = new Date(0);
    switch (timeRange) {
      case '1h':
        timeThreshold = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        timeThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        timeThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        timeThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }
    if (timeRange !== 'custom') {
      filtered = filtered.filter((error) => error.timestamp >= timeThreshold);
    }

    // Workflow status filter
    if (workflowStatus !== 'all') {
      // In a real app, this would check actual workflow status
      // For now, we'll filter by resolved status
      if (workflowStatus === 'active') {
        filtered = filtered.filter((error) => !error.resolved);
      } else if (workflowStatus === 'paused') {
        filtered = filtered.filter((error) => error.resolved);
      }
    }

    // Error type filter
    if (errorType !== 'all') {
      filtered = filtered.filter((error) => error.errorType === errorType);
    }

    return filtered;
  }, [errors, searchQuery, severity, timeRange, workflowStatus, errorType]);

  const handleViewDetails = (error: WorkflowError) => {
    setSelectedError(error);
    setIsModalOpen(true);
  };

  const handleRetry = async (errorId: string) => {
    // In a real app, this would trigger a retry API call
    console.log('Retrying error:', errorId);
    // For now, just show a notification
    alert('Retry initiated for error ' + errorId);
    // Refresh errors after retry
    await fetchErrors();
  };

  const handleMarkResolved = async (errorId: string) => {
    try {
      const response = await fetch('/api/errors', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: errorId,
          resolved: true,
        }),
      });

      if (response.ok) {
        // Refresh errors
        await fetchErrors();
      } else {
        alert('Failed to mark error as resolved');
      }
    } catch (error) {
      console.error('Error marking as resolved:', error);
      alert('Failed to mark error as resolved');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[#BEBEBE]">Loading errors...</div>
      </div>
    );
  }

  return (
    <div>
      <ErrorFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        severity={severity}
        onSeverityChange={setSeverity}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        workflowStatus={workflowStatus}
        onWorkflowStatusChange={setWorkflowStatus}
        errorType={errorType}
        onErrorTypeChange={setErrorType}
      />

      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-[#BEBEBE]">
          Showing {filteredErrors.length} of {errors.length} errors
        </div>
        <Button variant="secondary" onClick={fetchErrors}>
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </Button>
      </div>

      {filteredErrors.length === 0 ? (
        <div className="bg-[#2A2A2A] border border-[#333333] rounded-xl p-8 md:p-12 text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-[#8A8A8A]" />
          <h3 className="text-lg font-semibold text-[#F5F5F5] mb-2">No errors found</h3>
          <p className="text-sm text-[#BEBEBE]">
            Try adjusting your filters to see more results.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredErrors.map((error) => (
            <ErrorCard
              key={error.id}
              error={error}
              onViewDetails={handleViewDetails}
              onRetry={handleRetry}
              onMarkResolved={handleMarkResolved}
            />
          ))}
        </div>
      )}

      <ErrorDetailsModal
        error={selectedError}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedError(null);
        }}
      />
    </div>
  );
}

