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
  const [previousErrorIds, setPreviousErrorIds] = useState<Set<string>>(new Set());

  const playNotificationSound = () => {
    // Check if notification sound is enabled in settings
    const soundEnabled = localStorage.getItem('notificationSoundEnabled');
    if (soundEnabled === 'false') {
      return;
    }

    // Check if page is visible (not in background tab)
    if (document.hidden || document.visibilityState === 'hidden') {
      return;
    }

    try {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Configure the beep sound (pleasant notification tone)
      oscillator.frequency.value = 800; // Higher pitch for notification
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error playing notification sound:', error);
      }
    }
  };

  const fetchErrors = async () => {
    try {
      // Only fetch errors that are NOT fixed
      const response = await fetch('/api/errors?fixed=false');
      if (response.ok) {
        const data = await response.json();
        // Convert timestamp strings back to Date objects
        const errors = (data.errors || []).map((error: any) => ({
          ...error,
          timestamp: error.timestamp ? new Date(error.timestamp) : new Date(),
        }));
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Frontend] Fetched ${errors.length} errors (fixed=false)`);
        }
        
        // Check for new errors
        if (previousErrorIds.size > 0 && errors.length > 0) {
          const currentErrorIds = new Set<string>(errors.map((e: WorkflowError) => e.id));
          const newErrorIds = Array.from<string>(currentErrorIds).filter((id: string) => !previousErrorIds.has(id));
          
          if (newErrorIds.length > 0) {
            if (process.env.NODE_ENV === 'development') {
              console.log(`[Frontend] 🎵 New errors detected: ${newErrorIds.length}`);
            }
            playNotificationSound();
          }
        }
        
        // Update previous error IDs
        setPreviousErrorIds(new Set(errors.map((e: WorkflowError) => e.id)));
        setErrors(errors);
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
      filtered = filtered.filter((error) => {
        // If timestamp is invalid or missing, include it (don't filter out)
        if (!error.timestamp || isNaN(error.timestamp.getTime())) {
          return true;
        }
        return error.timestamp >= timeThreshold;
      });
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


  const handleMarkResolved = async (errorId: string) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Frontend] Marking error as resolved:', errorId);
      }
      
      // Remove the error from the local state immediately for smooth animation
      setErrors(prevErrors => prevErrors.filter(e => e.id !== errorId));
      
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

      const responseData = await response.json().catch(() => ({}));

      if (response.ok) {
        // Wait 2 seconds for Supabase to process and cache to clear, then refresh
        // This ensures we get the updated data from Supabase
        setTimeout(async () => {
          await fetchErrors();
        }, 2000);
      } else {
        const errorMessage = responseData.message || responseData.error || `HTTP ${response.status}: ${response.statusText}`;
        alert(`Failed to mark error as resolved: ${errorMessage}`);
        // Re-fetch to restore the error if the API call failed
        await fetchErrors();
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[Frontend] Error marking as resolved:', error);
      }
      alert(`Failed to mark error as resolved: ${error instanceof Error ? error.message : 'Network error'}`);
      // Re-fetch to restore the error if the API call failed
      await fetchErrors();
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
    <div className="flex flex-col h-[calc(100vh-3rem)]">
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
          Showing {filteredErrors.length} of {errors.length} errors
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
          <h3 className="text-lg font-semibold text-[#F5F5F5] mb-2">No errors found</h3>
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
                isResolved={false}
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

