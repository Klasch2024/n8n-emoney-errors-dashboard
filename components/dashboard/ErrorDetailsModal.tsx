import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { format } from 'date-fns';
import { WorkflowError } from '@/types';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';

interface ErrorDetailsModalProps {
  error: WorkflowError | null;
  isOpen: boolean;
  onClose: () => void;
}

const severityMap: Record<string, 'error' | 'warning' | 'info'> = {
  critical: 'error',
  high: 'error',
  medium: 'warning',
  low: 'info',
};

export const ErrorDetailsModal: React.FC<ErrorDetailsModalProps> = ({
  error,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState<string | null>(null);

  if (!error) return null;

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Error Details">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-[#F5F5F5] mb-2">{error.workflowName}</h3>
          <div className="flex items-center gap-2 mb-4">
            <Badge variant={severityMap[error.severity] || 'neutral'}>
              {error.severity.toUpperCase()}
            </Badge>
            <Badge variant="neutral">{error.errorType}</Badge>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-[#F5F5F5] mb-2">Error Message</h4>
          <p className="text-sm text-[#BEBEBE]">{error.errorMessage}</p>
        </div>

        {error.stackTrace && (
          <div>
            <h4 className="text-sm font-semibold text-[#F5F5F5] mb-2">Stack Trace</h4>
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-md p-4 overflow-auto code-block">
              <pre className="text-xs text-[#F5F5F5] font-mono leading-relaxed whitespace-pre-wrap">
                {error.stackTrace}
              </pre>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-semibold text-[#F5F5F5] mb-2">Node Name</h4>
            <p className="text-sm text-[#BEBEBE]">{error.nodeName}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#F5F5F5] mb-2">Timestamp</h4>
            <p className="text-sm text-[#BEBEBE]">{format(error.timestamp, 'PPpp')}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#F5F5F5] mb-2">Retry Count</h4>
            <p className="text-sm text-[#BEBEBE]">{error.retryCount}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#F5F5F5] mb-2">Status</h4>
            <p className="text-sm text-[#BEBEBE]">{error.resolved ? 'Resolved' : 'Active'}</p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-[#F5F5F5] mb-2">Execution ID</h4>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-[#1A1A1A] border border-[#333333] rounded-md px-3 py-2 text-xs text-[#F5F5F5] font-mono">
              {error.executionId}
            </code>
            <button
              onClick={() => copyToClipboard(error.executionId, 'exec')}
              className="p-2 text-[#8A8A8A] hover:text-[#E67514] transition-colors"
            >
              {copied === 'exec' ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-[#F5F5F5] mb-2">Workflow ID</h4>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-[#1A1A1A] border border-[#333333] rounded-md px-3 py-2 text-xs text-[#F5F5F5] font-mono">
              {error.workflowId}
            </code>
            <button
              onClick={() => copyToClipboard(error.workflowId, 'workflow')}
              className="p-2 text-[#8A8A8A] hover:text-[#E67514] transition-colors"
            >
              {copied === 'workflow' ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        {error.inputData && (
          <div>
            <h4 className="text-sm font-semibold text-[#F5F5F5] mb-2">Input Data</h4>
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-md p-4 overflow-auto code-block">
              <pre className="text-xs text-[#F5F5F5] font-mono leading-relaxed">
                {JSON.stringify(error.inputData, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {error.outputData && (
          <div>
            <h4 className="text-sm font-semibold text-[#F5F5F5] mb-2">Output Data</h4>
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-md p-4 overflow-auto code-block">
              <pre className="text-xs text-[#F5F5F5] font-mono leading-relaxed">
                {JSON.stringify(error.outputData, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

