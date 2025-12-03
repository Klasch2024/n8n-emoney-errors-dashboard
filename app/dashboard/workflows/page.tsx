'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Play, Pause, ExternalLink, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface Workflow {
  id: string;
  name: string;
  active: boolean;
  nodes?: any[];
  tags?: Array<{ id: string; name: string }>;
  createdAt?: string;
  updatedAt?: string;
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[Frontend] Fetching workflows...');
      
      const response = await fetch('/api/workflows');
      console.log('[Frontend] Response status:', response.status);
      
      const data = await response.json();
      console.log('[Frontend] Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to fetch workflows');
      }

      // Handle both array response and object with workflows property
      const workflowsList = Array.isArray(data) 
        ? data 
        : (Array.isArray(data.workflows) ? data.workflows : []);
      
      console.log('[Frontend] Workflows list:', workflowsList);
      console.log('[Frontend] Workflows count:', workflowsList.length);
      
      setWorkflows(workflowsList);
    } catch (err) {
      console.error('[Frontend] Error fetching workflows:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch workflows');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const filteredWorkflows = Array.isArray(workflows) ? workflows.filter((workflow) => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterActive === 'all' ||
      (filterActive === 'active' && workflow.active) ||
      (filterActive === 'inactive' && !workflow.active);
    return matchesSearch && matchesFilter;
  }) : [];

  const activeCount = workflows.filter((w) => w.active).length;
  const inactiveCount = workflows.filter((w) => !w.active).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4 text-[#E67514]" size={48} />
          <p className="text-[#BEBEBE]">Loading workflows...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 text-[#EF4444]" size={48} />
          <h3 className="text-lg font-semibold text-[#F5F5F5] mb-2">Error loading workflows</h3>
          <p className="text-sm text-[#BEBEBE] mb-4">{error}</p>
          <Button variant="primary" onClick={fetchWorkflows}>
            <RefreshCw size={16} className="mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Sticky Header Section */}
      <div className="sticky top-0 z-50 pb-4 mb-4 border-b border-[#333333] pt-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-[#F5F5F5] mb-2">Workflows</h2>
            <p className="text-sm text-[#BEBEBE]">
              Showing {filteredWorkflows.length} of {workflows.length} workflows
              {filterActive !== 'all' && (
                <span>
                  {' '}
                  ({filterActive === 'active' ? activeCount : inactiveCount}{' '}
                  {filterActive === 'active' ? 'active' : 'inactive'})
                </span>
              )}
            </p>
          </div>
          <Button variant="primary" onClick={fetchWorkflows}>
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by workflow name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-[#2A2A2A] border border-[#333333] rounded-lg text-[#F5F5F5] placeholder-[#8A8A8A] focus:outline-none focus:border-[#E67514] transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterActive('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterActive === 'all'
                  ? 'bg-[#E67514] text-white'
                  : 'bg-[#2A2A2A] text-[#BEBEBE] hover:bg-[#333333]'
              }`}
            >
              All ({workflows.length})
            </button>
            <button
              onClick={() => setFilterActive('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterActive === 'active'
                  ? 'bg-[#E67514] text-white'
                  : 'bg-[#2A2A2A] text-[#BEBEBE] hover:bg-[#333333]'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setFilterActive('inactive')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterActive === 'inactive'
                  ? 'bg-[#E67514] text-white'
                  : 'bg-[#2A2A2A] text-[#BEBEBE] hover:bg-[#333333]'
              }`}
            >
              Inactive ({inactiveCount})
            </button>
          </div>
        </div>
      </div>

      {/* Workflows List */}
      {filteredWorkflows.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto mb-4 text-[#8A8A8A]" size={48} />
          <h3 className="text-lg font-semibold text-[#F5F5F5] mb-2">No workflows found</h3>
          <p className="text-sm text-[#BEBEBE]">
            {searchQuery || filterActive !== 'all'
              ? 'Try adjusting your filters to see more results.'
              : 'No workflows available in your n8n account.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkflows.map((workflow) => (
            <Card key={workflow.id} hover className="flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-base font-semibold text-[#F5F5F5] flex-1 pr-2">
                  {workflow.name}
                </h3>
                <Badge variant={workflow.active ? 'success' : 'neutral'}>
                  {workflow.active ? (
                    <>
                      <Play size={12} className="mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <Pause size={12} className="mr-1" />
                      Inactive
                    </>
                  )}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {workflow.tags && workflow.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {workflow.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag.id}
                        className="px-2 py-1 text-xs bg-[#333333] text-[#BEBEBE] rounded"
                      >
                        {tag.name}
                      </span>
                    ))}
                    {workflow.tags.length > 3 && (
                      <span className="px-2 py-1 text-xs text-[#8A8A8A]">
                        +{workflow.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="text-xs text-[#8A8A8A] mb-4">
                {workflow.nodes && (
                  <span>{workflow.nodes.length} node{workflow.nodes.length !== 1 ? 's' : ''}</span>
                )}
              </div>

              <div className="mt-auto pt-4 border-t border-[#333333]">
                <Button
                  variant="primary"
                  onClick={() => {
                    const n8nUrl = 'https://n8n.srv1023747.hstgr.cloud';
                    window.open(`${n8nUrl}/workflow/${workflow.id}`, '_blank');
                  }}
                  className="w-full"
                >
                  <ExternalLink size={16} className="mr-2" />
                  Open in n8n
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

