import React, { useState } from 'react';
import { Clock, Copy, CheckCircle2, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { WorkflowError } from '@/types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface ErrorCardProps {
  error: WorkflowError;
  onViewDetails: (error: WorkflowError) => void;
  onMarkResolved: (errorId: string) => void;
  showUnmarkButton?: boolean; // If true, show "Unmark as Resolved" instead
  isResolved?: boolean; // If true, show resolved indicator
}

const severityMap: Record<string, 'error' | 'warning' | 'info'> = {
  critical: 'error',
  high: 'error',
  medium: 'warning',
  low: 'info',
};

const errorTypeLabels: Record<string, string> = {
  timeout: 'Timeout',
  connection: 'Connection',
  validation: 'Validation',
  runtime: 'Runtime',
  other: 'Other',
};

export const ErrorCard: React.FC<ErrorCardProps> = ({
  error,
  onViewDetails,
  onMarkResolved,
  showUnmarkButton = false,
  isResolved = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleMarkResolvedClick = () => {
    setIsRemoving(true);
    // Wait for animation to complete before calling the callback
    setTimeout(() => {
      onMarkResolved(error.id);
    }, 800); // Match the animation duration (500ms fill + 300ms fade)
  };

  const truncatedMessage =
    error.errorMessage.length > 150 && !expanded
      ? `${error.errorMessage.substring(0, 150)}...`
      : error.errorMessage;

  return (
    <Card 
      hover 
      className={`mb-4 relative overflow-hidden transition-opacity duration-300 ease-in-out ${
        isRemoving 
          ? 'opacity-0 pointer-events-none' 
          : 'opacity-100'
      } ${isResolved ? '!bg-[#1a3a2a] !border-[#2d5a3f] hover:!border-[#2d5a3f]' : ''}`}
    >
      {/* Green fill animation overlay */}
      {isRemoving && (
        <div 
          className="absolute inset-0 bg-[#10B981] z-10 fill-animation"
          style={{
            transformOrigin: 'right center',
          }}
        />
      )}
      <div className="relative z-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-[#F5F5F5]">{error.workflowName}</h3>
          <Badge variant={severityMap[error.severity] || 'neutral'}>
            {error.severity.toUpperCase()}
          </Badge>
        </div>

        <div className="text-sm text-[#BEBEBE] leading-relaxed mb-4">
          {truncatedMessage}
          {error.errorMessage.length > 150 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[#E67514] ml-2 hover:underline"
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>

        <div className="mb-4">
          <div className="text-sm text-[#BEBEBE] mb-2">
            <span className="font-medium">Node:</span> {error.nodeName}
          </div>
          <Badge variant="neutral" className="mr-2">
            {errorTypeLabels[error.errorType] || error.errorType}
          </Badge>
        </div>
      </div>

      <div className={`flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mt-4 pt-4 border-t border-[#333333] relative z-0 ${isRemoving ? 'z-0' : ''}`}>
        <div className="flex items-center gap-2 text-xs text-[#8A8A8A]">
          <Clock size={16} />
          <span>{formatDistanceToNow(error.timestamp, { addSuffix: true })}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-2">
          <button
            onClick={() => copyToClipboard(error.executionId, 'exec')}
            className="flex items-center gap-1 text-xs text-[#8A8A8A] hover:text-[#E67514] transition-colors"
          >
            <Copy size={14} />
            {copied === 'exec' ? 'Copied!' : 'Exec ID'}
          </button>
          <button
            onClick={() => copyToClipboard(error.workflowId, 'workflow')}
            className="flex items-center gap-1 text-xs text-[#8A8A8A] hover:text-[#E67514] transition-colors"
          >
            <Copy size={14} />
            {copied === 'workflow' ? 'Copied!' : 'Workflow ID'}
          </button>
          <span className="text-xs text-[#8A8A8A]">Retries: {error.retryCount}</span>
        </div>
      </div>

      <div className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4 relative z-0 ${isRemoving ? 'z-0' : ''}`}>
        {error.outputData?.executionUrl && (
          <Button 
            variant="primary" 
            onClick={() => window.open(error.outputData?.executionUrl, '_blank')} 
            className="flex-1 sm:flex-initial"
          >
            <ExternalLink size={16} className="mr-2" />
            Check Error
          </Button>
        )}
        <Button variant="primary" onClick={() => onViewDetails(error)} className="flex-1 sm:flex-initial">
          <ExternalLink size={16} className="mr-2" />
          View Details
        </Button>
        <Button
          variant="ghost"
          onClick={handleMarkResolvedClick}
          disabled={isRemoving}
          className={`flex-1 sm:flex-initial !border !border-[#E67514] hover:!bg-[#E67514]/10 transition-all duration-200 ${
            isRemoving ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          style={{ 
            borderWidth: '1px', 
            borderStyle: 'solid', 
            borderColor: '#E67514'
          }}
        >
          <CheckCircle2 size={16} className={`mr-2 transition-transform duration-200 ${isRemoving ? 'scale-110' : ''}`} />
          {showUnmarkButton ? 'Unmark as Resolved' : 'Mark Resolved'}
        </Button>
      </div>
    </Card>
  );
};

