'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { WorkflowError, ErrorSeverity, ErrorType, TimeRange, WorkflowStatus } from '@/types';
import { ErrorCard } from '@/components/dashboard/ErrorCard';
import { ErrorFilters } from '@/components/dashboard/ErrorFilters';
import { ErrorDetailsModal } from '@/components/dashboard/ErrorDetailsModal';
import { Button } from '@/components/ui/Button';

export default function FixedErrorsPage() {
  const [errors, setErrors] = useState<WorkflowError[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchErrors = async () => {
    try {
      const response = await fetch('/api/errors?fixed=true');
      if (response.ok) {
        const data = await response.json();
        // Convert timestamp strings back to Date objects
        const errors = (data.errors || []).map((error: any) => ({
          ...error,
          timestamp: error.timestamp ? new Date(error.timestamp) : new Date(),
        }));
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Frontend] Fetched ${errors.length} fixed errors`);
        }
        setErrors(errors);
      } else {
        console.error('Failed to fetch fixed errors');
        setErrors([]);
      }
    } catch (error) {
      console.error('Error fetching fixed errors:', error);
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
      filtered = filtered.filter((error) => {
        // If timestamp is invalid or missing, include it (don't filter out)
        if (!error.timestamp || isNaN(error.timestamp.getTime())) {
          return true;
        }
        return error.timestamp >= timeThreshold;
      });
    }

    // Workflow status filter - for fixed errors, we show all (they're all resolved)
    // This filter doesn't really apply here, but we keep it for consistency

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


  const handleMarkResolved = async (errorId: string) => {
    // For fixed errors page, we can allow unmarking as resolved
    try {
      const response = await fetch('/api/errors', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: errorId,
          resolved: false,
        }),
      });

      if (response.ok) {
        // Refresh errors - this will remove it from fixed errors
        await fetchErrors();
      } else {
        alert('Failed to unmark error as resolved');
      }
    } catch (error) {
      console.error('Error unmarking resolved:', error);
      alert('Failed to unmark error as resolved');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[#BEBEBE]">Loading fixed errors...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0 z-10 pb-4 border-b border-[#333333]">
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

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-[#BEBEBE]">
            Showing {filteredErrors.length} of {errors.length} fixed errors
          </div>
          <Button variant="secondary" onClick={fetchErrors}>
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto pr-2 -mr-2">
        {filteredErrors.length === 0 ? (
          <div className="bg-[#2A2A2A] border border-[#333333] rounded-xl p-8 md:p-12 text-center mt-4">
            <AlertCircle size={48} className="mx-auto mb-4 text-[#8A8A8A]" />
            <h3 className="text-lg font-semibold text-[#F5F5F5] mb-2">No fixed errors found</h3>
            <p className="text-sm text-[#BEBEBE]">
              Try adjusting your filters to see more results.
            </p>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {filteredErrors.map((error) => (
              <ErrorCard
                key={error.id}
                error={error}
                onViewDetails={handleViewDetails}
                onMarkResolved={handleMarkResolved}
                showUnmarkButton={true}
                isResolved={true}
              />
            ))}
          </div>
        )}
      </div>

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

