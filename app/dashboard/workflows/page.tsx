'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, Play, Pause, ExternalLink, AlertCircle, Star } from 'lucide-react';
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
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive' | 'starred'>('all');
  const [n8nBaseUrl, setN8nBaseUrl] = useState<string>('');
  const [starredWorkflows, setStarredWorkflows] = useState<Set<string>>(new Set());

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      setError(null);
      if (process.env.NODE_ENV === 'development') {
        console.log('[Frontend] Fetching workflows...');
      }
      
      const response = await fetch('/api/workflows');
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to fetch workflows');
      }

      // Handle both array response and object with workflows property
      let workflowsList = Array.isArray(data) 
        ? data 
        : (Array.isArray(data.workflows) ? data.workflows : []);
      
      // Deduplicate workflows by ID
      const uniqueWorkflows = workflowsList.reduce((acc: Workflow[], workflow: Workflow) => {
        if (!acc.find((w) => w.id === workflow.id)) {
          acc.push(workflow);
        }
        return acc;
      }, [] as Workflow[]);
      
      workflowsList = uniqueWorkflows;
      
      // Extract n8n base URL if provided
      if (data.n8nBaseUrl) {
        setN8nBaseUrl(data.n8nBaseUrl);
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[Frontend] Workflows count:', workflowsList.length);
        if (workflowsList.length > 0) {
          console.log('[Frontend] First workflow ID:', workflowsList[0].id);
          console.log('[Frontend] First workflow:', workflowsList[0]);
        }
        // Check for duplicates
        const ids = workflowsList.map(w => w.id);
        const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
        if (duplicates.length > 0) {
          console.warn('[Frontend] Found duplicate workflow IDs:', duplicates);
        }
      }
      
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
    // Load starred workflows from localStorage
    const saved = localStorage.getItem('starredWorkflows');
    if (saved) {
      try {
        const starred = JSON.parse(saved);
        setStarredWorkflows(new Set(starred));
        if (process.env.NODE_ENV === 'development') {
          console.log('[Star] Loaded starred workflows from localStorage:', starred);
        }
      } catch (e) {
        console.error('Error loading starred workflows:', e);
      }
    }
  }, []);

  const toggleStar = (workflowId: string) => {
    setStarredWorkflows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(workflowId)) {
        newSet.delete(workflowId);
      } else {
        newSet.add(workflowId);
      }
      // Save to localStorage
      localStorage.setItem('starredWorkflows', JSON.stringify(Array.from(newSet)));
      if (process.env.NODE_ENV === 'development') {
        console.log('[Star] Toggled star for workflow:', workflowId);
        console.log('[Star] Starred workflows:', Array.from(newSet));
      }
      return newSet;
    });
  };

  const filteredWorkflows = useMemo(() => {
    if (!Array.isArray(workflows)) return [];
    
    return workflows.filter((workflow) => {
      const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesFilter = false;
      if (filterActive === 'all') {
        matchesFilter = true;
      } else if (filterActive === 'active') {
        matchesFilter = workflow.active;
      } else if (filterActive === 'inactive') {
        matchesFilter = !workflow.active;
      } else if (filterActive === 'starred') {
        const isStarred = starredWorkflows.has(workflow.id);
        if (process.env.NODE_ENV === 'development') {
          console.log('[Filter] Checking workflow:', {
            id: workflow.id,
            name: workflow.name,
            isStarred,
            starredWorkflows: Array.from(starredWorkflows),
          });
        }
        matchesFilter = isStarred;
      }
      
      return matchesSearch && matchesFilter;
    });
  }, [workflows, searchQuery, filterActive, starredWorkflows]);

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
    <div className="flex flex-col h-[calc(100vh-3rem)]">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0 pb-4 mb-4 border-b border-[#333333] pt-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-[#F5F5F5] mb-2">Workflows</h2>
            <p className="text-sm text-[#BEBEBE]">
              Showing {filteredWorkflows.length} of {workflows.length} workflows
              {filterActive !== 'all' && (
                <span>
                  {' '}
                  ({filterActive === 'active' ? activeCount : filterActive === 'inactive' ? inactiveCount : starredWorkflows.size}{' '}
                  {filterActive === 'active' ? 'active' : filterActive === 'inactive' ? 'inactive' : 'starred'})
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
            <button
              onClick={() => setFilterActive('starred')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                filterActive === 'starred'
                  ? 'bg-[#E67514] text-white'
                  : 'bg-[#2A2A2A] text-[#BEBEBE] hover:bg-[#333333]'
              }`}
            >
              <Star size={14} className={starredWorkflows.size > 0 ? 'fill-current' : ''} />
              Starred ({starredWorkflows.size})
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Workflows List */}
      <div className="flex-1 overflow-y-auto pr-2 -mr-2">
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
                <div className="flex items-center gap-2 flex-1 pr-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (process.env.NODE_ENV === 'development') {
                        console.log('[Star] Clicked star for workflow:', workflow.id, workflow.name);
                      }
                      toggleStar(workflow.id);
                    }}
                    className="flex-shrink-0 p-1 hover:bg-[#333333] rounded transition-colors"
                    title={starredWorkflows.has(workflow.id) ? 'Unstar workflow' : 'Star workflow'}
                  >
                    <Star
                      size={18}
                      className={`transition-all ${
                        starredWorkflows.has(workflow.id)
                          ? 'text-[#F59E0B] fill-[#F59E0B]'
                          : 'text-[#8A8A8A] hover:text-[#F59E0B]'
                      }`}
                    />
                  </button>
                  <h3 className="text-base font-semibold text-[#F5F5F5] flex-1">
                    {workflow.name}
                  </h3>
                </div>
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
                      if (!n8nBaseUrl) {
                        alert('n8n base URL is not configured. Please set N8N_BASE_URL environment variable.');
                        return;
                      }
                      window.open(`${n8nBaseUrl}/workflow/${workflow.id}`, '_blank');
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
    </div>
  );
}

