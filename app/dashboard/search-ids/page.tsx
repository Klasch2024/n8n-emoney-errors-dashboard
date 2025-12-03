'use client';

import React, { useState, useEffect } from 'react';
import { Search, Loader2, AlertCircle, Tag, Copy, Check } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface CloseCustomField {
  id: string;
  name: string;
  type: string;
  accepts_multiple_values?: boolean;
  editable_by?: string[];
  required?: boolean;
  choices?: string[];
  converting_to_type?: string;
}

interface CloseUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  image?: string;
  role_id?: string;
  role_name?: string;
  [key: string]: any;
}

interface CloseLeadStatus {
  id: string;
  label: string;
  type?: string;
  organization_id?: string;
  [key: string]: any;
}

interface CloseOpportunityStatus {
  id: string;
  label: string;
  type?: string;
  organization_id?: string;
  [key: string]: any;
}

export default function SearchIdsPage() {
  const [activeTab, setActiveTab] = useState<'lead' | 'user' | 'opportunity' | 'lead-status' | 'opportunity-status'>('lead');
  const [customFields, setCustomFields] = useState<CloseCustomField[]>([]);
  const [users, setUsers] = useState<CloseUser[]>([]);
  const [leadStatuses, setLeadStatuses] = useState<CloseLeadStatus[]>([]);
  const [opportunityStatuses, setOpportunityStatuses] = useState<CloseOpportunityStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'lead' || activeTab === 'opportunity') {
      fetchCustomFields();
    } else if (activeTab === 'user') {
      fetchUsers();
    } else if (activeTab === 'lead-status') {
      fetchLeadStatuses();
    } else if (activeTab === 'opportunity-status') {
      fetchOpportunityStatuses();
    }
  }, [activeTab]);

  const fetchCustomFields = async () => {
    setLoading(true);
    setError(null);
    try {
      let endpoint = '/api/close/custom-fields';
      if (activeTab === 'opportunity') {
        endpoint = '/api/close/opportunity-custom-fields';
      }
      
      const response = await fetch(endpoint);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch custom fields');
      }
      
      setCustomFields(result.data || []);
    } catch (err) {
      console.error('Error fetching custom fields:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/close/users');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch users');
      }
      
      setUsers(result.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeadStatuses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/close/lead-statuses');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch lead statuses');
      }
      
      setLeadStatuses(result.data || []);
    } catch (err) {
      console.error('Error fetching lead statuses:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchOpportunityStatuses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/close/opportunity-statuses');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch opportunity statuses');
      }
      
      setOpportunityStatuses(result.data || []);
    } catch (err) {
      console.error('Error fetching opportunity statuses:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredFields = customFields.filter(field =>
    field.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    field.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    field.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(user => {
    const name = (user.name || `${user.first_name || ''} ${user.last_name || ''}`).toLowerCase();
    const email = (user.email || '').toLowerCase();
    const id = (user.id || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || email.includes(query) || id.includes(query);
  });

  const filteredLeadStatuses = leadStatuses.filter(status => {
    const label = (status.label || '').toLowerCase();
    const id = (status.id || '').toLowerCase();
    const type = (status.type || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return label.includes(query) || id.includes(query) || type.includes(query);
  });

  const filteredOpportunityStatuses = opportunityStatuses.filter(status => {
    const label = (status.label || '').toLowerCase();
    const id = (status.id || '').toLowerCase();
    const type = (status.type || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return label.includes(query) || id.includes(query) || type.includes(query);
  });

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'text': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'number': 'bg-green-500/20 text-green-400 border-green-500/30',
      'date': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'choices': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'boolean': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      'url': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      'email': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    };
    return colors[type.toLowerCase()] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const copyToClipboard = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0 z-10 pb-4 border-b border-[#333333]">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-[#F5F5F5] mb-2">Search IDs</h1>
          <p className="text-[#BEBEBE]">Browse and search Close CRM custom fields and users</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-[#333333] mb-4">
        <button
          onClick={() => setActiveTab('lead')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'lead'
              ? 'text-[#E67514] border-b-2 border-[#E67514]'
              : 'text-[#BEBEBE] hover:text-[#F5F5F5]'
          }`}
        >
          Lead Custom Fields
        </button>
        <button
          onClick={() => setActiveTab('user')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'user'
              ? 'text-[#E67514] border-b-2 border-[#E67514]'
              : 'text-[#BEBEBE] hover:text-[#F5F5F5]'
          }`}
        >
          User IDs
        </button>
        <button
          onClick={() => setActiveTab('opportunity')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'opportunity'
              ? 'text-[#E67514] border-b-2 border-[#E67514]'
              : 'text-[#BEBEBE] hover:text-[#F5F5F5]'
          }`}
        >
          Opportunity Custom Fields
        </button>
        <button
          onClick={() => setActiveTab('lead-status')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'lead-status'
              ? 'text-[#E67514] border-b-2 border-[#E67514]'
              : 'text-[#BEBEBE] hover:text-[#F5F5F5]'
          }`}
        >
          Lead Statuses
        </button>
        <button
          onClick={() => setActiveTab('opportunity-status')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'opportunity-status'
              ? 'text-[#E67514] border-b-2 border-[#E67514]'
              : 'text-[#BEBEBE] hover:text-[#F5F5F5]'
          }`}
        >
          Opportunity Statuses
        </button>
      </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8A8A8A]" size={20} />
          <input
            type="text"
            placeholder="Search by name, ID, email, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#2A2A2A] border border-[#333333] rounded-lg text-[#F5F5F5] placeholder-[#8A8A8A] focus:outline-none focus:border-[#E67514] transition-colors"
          />
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto pr-2 -mr-2">
        <div className="space-y-6">
          {/* Content */}
      {activeTab === 'lead' && (
        <div>
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-[#E67514]" size={32} />
            </div>
          )}

          {error && (
            <Card className="p-6">
              <div className="flex items-center gap-3 text-[#EF4444]">
                <AlertCircle size={20} />
                <div>
                  <p className="font-medium">Error loading custom fields</p>
                  <p className="text-sm text-[#BEBEBE] mt-1">{error}</p>
                </div>
                <Button
                  variant="primary"
                  onClick={fetchCustomFields}
                  className="ml-auto"
                >
                  Retry
                </Button>
              </div>
            </Card>
          )}

          {!loading && !error && (
            <>
              <div className="mb-4 text-sm text-[#BEBEBE]">
                Showing {filteredFields.length} of {customFields.length} custom fields
              </div>

              {filteredFields.length === 0 ? (
                <Card className="p-8 text-center">
                  <Tag className="mx-auto mb-4 text-[#8A8A8A]" size={48} />
                  <p className="text-[#BEBEBE]">No custom fields found</p>
                  {searchQuery && (
                    <p className="text-sm text-[#8A8A8A] mt-2">
                      Try adjusting your search query
                    </p>
                  )}
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredFields.map((field) => (
                    <Card key={field.id} hover className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-[#F5F5F5]">
                              {field.name}
                            </h3>
                            {field.required && (
                              <Badge variant="error" className="text-xs">
                                Required
                              </Badge>
                            )}
                            {field.accepts_multiple_values && (
                              <Badge variant="primary" className="text-xs">
                                Multiple
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <Badge className={getTypeColor(field.type)}>
                              {field.type}
                            </Badge>
                            {field.converting_to_type && (
                              <Badge variant="warning" className="text-xs">
                                Converting to {field.converting_to_type}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm text-[#BEBEBE] font-mono bg-[#1A1A1A] px-3 py-2 rounded border border-[#333333] flex-1">
                              ID: {field.id}
                            </div>
                            <button
                              onClick={() => copyToClipboard(field.id)}
                              className="p-2 bg-[#2A2A2A] border border-[#333333] rounded hover:bg-[#333333] hover:border-[#E67514] transition-colors"
                              title="Copy ID"
                            >
                              {copiedId === field.id ? (
                                <Check size={16} className="text-green-400" />
                              ) : (
                                <Copy size={16} className="text-[#BEBEBE]" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {field.choices && field.choices.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-[#333333]">
                          <p className="text-sm font-medium text-[#BEBEBE] mb-2">Choices:</p>
                          <div className="flex flex-wrap gap-2">
                            {field.choices.map((choice, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {choice}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {field.editable_by && field.editable_by.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-[#333333]">
                          <p className="text-sm font-medium text-[#BEBEBE] mb-2">
                            Editable by: {field.editable_by.join(', ')}
                          </p>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'user' && (
        <div>
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-[#E67514]" size={32} />
            </div>
          )}

          {error && (
            <Card className="p-6">
              <div className="flex items-center gap-3 text-[#EF4444]">
                <AlertCircle size={20} />
                <div>
                  <p className="font-medium">Error loading users</p>
                  <p className="text-sm text-[#BEBEBE] mt-1">{error}</p>
                </div>
                <Button
                  variant="primary"
                  onClick={fetchUsers}
                  className="ml-auto"
                >
                  Retry
                </Button>
              </div>
            </Card>
          )}

          {!loading && !error && (
            <>
              <div className="mb-4 text-sm text-[#BEBEBE]">
                Showing {filteredUsers.length} of {users.length} users
              </div>

              {filteredUsers.length === 0 ? (
                <Card className="p-8 text-center">
                  <Tag className="mx-auto mb-4 text-[#8A8A8A]" size={48} />
                  <p className="text-[#BEBEBE]">No users found</p>
                  {searchQuery && (
                    <p className="text-sm text-[#8A8A8A] mt-2">
                      Try adjusting your search query
                    </p>
                  )}
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredUsers.map((user) => (
                    <Card key={user.id} hover className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-[#F5F5F5]">
                              {user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unnamed User'}
                            </h3>
                            {user.role_name && (
                              <Badge variant="primary" className="text-xs">
                                {user.role_name}
                              </Badge>
                            )}
                          </div>
                          <div className="mb-3">
                            <p className="text-sm text-[#BEBEBE] mb-1">
                              <span className="font-medium">Email:</span> {user.email || 'N/A'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm text-[#BEBEBE] font-mono bg-[#1A1A1A] px-3 py-2 rounded border border-[#333333] flex-1">
                              ID: {user.id}
                            </div>
                            <button
                              onClick={() => copyToClipboard(user.id)}
                              className="p-2 bg-[#2A2A2A] border border-[#333333] rounded hover:bg-[#333333] hover:border-[#E67514] transition-colors"
                              title="Copy ID"
                            >
                              {copiedId === user.id ? (
                                <Check size={16} className="text-green-400" />
                              ) : (
                                <Copy size={16} className="text-[#BEBEBE]" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'opportunity' && (
        <div>
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-[#E67514]" size={32} />
            </div>
          )}

          {error && (
            <Card className="p-6">
              <div className="flex items-center gap-3 text-[#EF4444]">
                <AlertCircle size={20} />
                <div>
                  <p className="font-medium">Error loading custom fields</p>
                  <p className="text-sm text-[#BEBEBE] mt-1">{error}</p>
                </div>
                <Button
                  variant="primary"
                  onClick={fetchCustomFields}
                  className="ml-auto"
                >
                  Retry
                </Button>
              </div>
            </Card>
          )}

          {!loading && !error && (
            <>
              <div className="mb-4 text-sm text-[#BEBEBE]">
                Showing {filteredFields.length} of {customFields.length} custom fields
              </div>

              {filteredFields.length === 0 ? (
                <Card className="p-8 text-center">
                  <Tag className="mx-auto mb-4 text-[#8A8A8A]" size={48} />
                  <p className="text-[#BEBEBE]">No custom fields found</p>
                  {searchQuery && (
                    <p className="text-sm text-[#8A8A8A] mt-2">
                      Try adjusting your search query
                    </p>
                  )}
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredFields.map((field) => (
                    <Card key={field.id} hover className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-[#F5F5F5]">
                              {field.name}
                            </h3>
                            {field.required && (
                              <Badge variant="error" className="text-xs">
                                Required
                              </Badge>
                            )}
                            {field.accepts_multiple_values && (
                              <Badge variant="primary" className="text-xs">
                                Multiple
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <Badge className={getTypeColor(field.type)}>
                              {field.type}
                            </Badge>
                            {field.converting_to_type && (
                              <Badge variant="warning" className="text-xs">
                                Converting to {field.converting_to_type}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm text-[#BEBEBE] font-mono bg-[#1A1A1A] px-3 py-2 rounded border border-[#333333] flex-1">
                              ID: {field.id}
                            </div>
                            <button
                              onClick={() => copyToClipboard(field.id)}
                              className="p-2 bg-[#2A2A2A] border border-[#333333] rounded hover:bg-[#333333] hover:border-[#E67514] transition-colors"
                              title="Copy ID"
                            >
                              {copiedId === field.id ? (
                                <Check size={16} className="text-green-400" />
                              ) : (
                                <Copy size={16} className="text-[#BEBEBE]" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {field.choices && field.choices.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-[#333333]">
                          <p className="text-sm font-medium text-[#BEBEBE] mb-2">Choices:</p>
                          <div className="flex flex-wrap gap-2">
                            {field.choices.map((choice, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {choice}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {field.editable_by && field.editable_by.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-[#333333]">
                          <p className="text-sm font-medium text-[#BEBEBE] mb-2">
                            Editable by: {field.editable_by.join(', ')}
                          </p>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'lead-status' && (
        <div>
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-[#E67514]" size={32} />
            </div>
          )}

          {error && (
            <Card className="p-6">
              <div className="flex items-center gap-3 text-[#EF4444]">
                <AlertCircle size={20} />
                <div>
                  <p className="font-medium">Error loading lead statuses</p>
                  <p className="text-sm text-[#BEBEBE] mt-1">{error}</p>
                </div>
                <Button
                  variant="primary"
                  onClick={fetchLeadStatuses}
                  className="ml-auto"
                >
                  Retry
                </Button>
              </div>
            </Card>
          )}

          {!loading && !error && (
            <>
              <div className="mb-4 text-sm text-[#BEBEBE]">
                Showing {filteredLeadStatuses.length} of {leadStatuses.length} lead statuses
              </div>

              {filteredLeadStatuses.length === 0 ? (
                <Card className="p-8 text-center">
                  <Tag className="mx-auto mb-4 text-[#8A8A8A]" size={48} />
                  <p className="text-[#BEBEBE]">No lead statuses found</p>
                  {searchQuery && (
                    <p className="text-sm text-[#8A8A8A] mt-2">
                      Try adjusting your search query
                    </p>
                  )}
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredLeadStatuses.map((status) => (
                    <Card key={status.id} hover className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-[#F5F5F5]">
                              {status.label || 'Unnamed Status'}
                            </h3>
                            {status.type && (
                              <Badge variant="primary" className="text-xs">
                                {status.type}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm text-[#BEBEBE] font-mono bg-[#1A1A1A] px-3 py-2 rounded border border-[#333333] flex-1">
                              ID: {status.id}
                            </div>
                            <button
                              onClick={() => copyToClipboard(status.id)}
                              className="p-2 bg-[#2A2A2A] border border-[#333333] rounded hover:bg-[#333333] hover:border-[#E67514] transition-colors"
                              title="Copy ID"
                            >
                              {copiedId === status.id ? (
                                <Check size={16} className="text-green-400" />
                              ) : (
                                <Copy size={16} className="text-[#BEBEBE]" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'opportunity-status' && (
        <div>
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-[#E67514]" size={32} />
            </div>
          )}

          {error && (
            <Card className="p-6">
              <div className="flex items-center gap-3 text-[#EF4444]">
                <AlertCircle size={20} />
                <div>
                  <p className="font-medium">Error loading opportunity statuses</p>
                  <p className="text-sm text-[#BEBEBE] mt-1">{error}</p>
                </div>
                <Button
                  variant="primary"
                  onClick={fetchOpportunityStatuses}
                  className="ml-auto"
                >
                  Retry
                </Button>
              </div>
            </Card>
          )}

          {!loading && !error && (
            <>
              <div className="mb-4 text-sm text-[#BEBEBE]">
                Showing {filteredOpportunityStatuses.length} of {opportunityStatuses.length} opportunity statuses
              </div>

              {filteredOpportunityStatuses.length === 0 ? (
                <Card className="p-8 text-center">
                  <Tag className="mx-auto mb-4 text-[#8A8A8A]" size={48} />
                  <p className="text-[#BEBEBE]">No opportunity statuses found</p>
                  {searchQuery && (
                    <p className="text-sm text-[#8A8A8A] mt-2">
                      Try adjusting your search query
                    </p>
                  )}
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredOpportunityStatuses.map((status) => (
                    <Card key={status.id} hover className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-[#F5F5F5]">
                              {status.label || 'Unnamed Status'}
                            </h3>
                            {status.type && (
                              <Badge variant="primary" className="text-xs">
                                {status.type}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm text-[#BEBEBE] font-mono bg-[#1A1A1A] px-3 py-2 rounded border border-[#333333] flex-1">
                              ID: {status.id}
                            </div>
                            <button
                              onClick={() => copyToClipboard(status.id)}
                              className="p-2 bg-[#2A2A2A] border border-[#333333] rounded hover:bg-[#333333] hover:border-[#E67514] transition-colors"
                              title="Copy ID"
                            >
                              {copiedId === status.id ? (
                                <Check size={16} className="text-green-400" />
                              ) : (
                                <Copy size={16} className="text-[#BEBEBE]" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
        </div>
      </div>
    </div>
  );
}

