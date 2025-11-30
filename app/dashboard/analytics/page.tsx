'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  AlertTriangle,
  TrendingUp,
  Workflow,
  Clock,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { WorkflowError, ErrorAnalytics } from '@/types';
import { generateMockAnalytics } from '@/lib/mockData';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card } from '@/components/ui/Card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format } from 'date-fns';

export default function AnalyticsPage() {
  const [errors, setErrors] = useState<WorkflowError[]>([]);
  const [analytics, setAnalytics] = useState<ErrorAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchErrors = async () => {
    try {
      const response = await fetch('/api/errors');
      if (response.ok) {
        const data = await response.json();
        const fetchedErrors = data.errors || [];
        setErrors(fetchedErrors);
        
        // Generate analytics from fetched errors
        if (fetchedErrors.length > 0) {
          setAnalytics(generateMockAnalytics(fetchedErrors));
        } else {
          // If no errors, create empty analytics
          setAnalytics({
            totalErrors: 0,
            errorRate: 0,
            mostAffectedWorkflow: 'N/A',
            avgResolutionTime: 0,
            trends: [],
            errorsByType: [],
            topWorkflows: [],
          });
        }
      } else {
        console.error('Failed to fetch errors');
        setErrors([]);
        setAnalytics(null);
      }
    } catch (error) {
      console.error('Error fetching errors:', error);
      setErrors([]);
      setAnalytics(null);
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

  const chartData = useMemo(() => {
    if (!analytics) return [];
    return analytics.trends.map((trend) => ({
      date: format(trend.timestamp, 'MMM dd'),
      errors: trend.count,
    }));
  }, [analytics]);

  const errorTypeData = useMemo(() => {
    if (!analytics) return [];
    return analytics.errorsByType.map((item) => ({
      name: item.type.charAt(0).toUpperCase() + item.type.slice(1),
      value: item.count,
    }));
  }, [analytics]);

  const workflowData = useMemo(() => {
    if (!analytics) return [];
    return analytics.topWorkflows
      .slice(0, 5)
      .map((workflow) => ({
        name: workflow.workflowName,
        errors: workflow.errorCount,
      }))
      .reverse();
  }, [analytics]);

  const COLORS = ['#E67514', '#EF4444', '#F59E0B', '#10B981', '#3B82F6'];

  const totalErrorsChange = 5.2; // Mock change percentage
  const errorRateChange = -12.5; // Mock change percentage
  const avgResolutionChange = -8.3; // Mock change percentage

  if (isLoading || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[#BEBEBE]">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          icon={AlertTriangle}
          value={analytics.totalErrors}
          label="Total Errors"
          trend={{
            value: Math.abs(totalErrorsChange),
            isPositive: totalErrorsChange < 0,
          }}
        />
        <StatCard
          icon={TrendingUp}
          value={`${analytics.errorRate}/hr`}
          label="Error Rate"
          trend={{
            value: Math.abs(errorRateChange),
            isPositive: errorRateChange < 0,
          }}
        />
        <StatCard
          icon={Workflow}
          value={analytics.mostAffectedWorkflow}
          label="Most Affected Workflow"
        />
        <StatCard
          icon={Clock}
          value={`${Math.floor(analytics.avgResolutionTime / 60)}m`}
          label="Avg Resolution Time"
          trend={{
            value: Math.abs(avgResolutionChange),
            isPositive: avgResolutionChange < 0,
          }}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Error Trends Chart */}
        <Card>
          <h3 className="text-lg font-semibold text-[#F5F5F5] mb-4">Error Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
              <XAxis
                dataKey="date"
                stroke="#8A8A8A"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#8A8A8A" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A1A1A',
                  border: '1px solid #333333',
                  borderRadius: '0.375rem',
                  color: '#F5F5F5',
                }}
              />
              <Line
                type="monotone"
                dataKey="errors"
                stroke="#E67514"
                strokeWidth={2}
                dot={{ fill: '#E67514', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Error Distribution by Type */}
        <Card>
          <h3 className="text-lg font-semibold text-[#F5F5F5] mb-4">Errors by Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={errorTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {errorTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A1A1A',
                  border: '1px solid #333333',
                  borderRadius: '0.375rem',
                  color: '#F5F5F5',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top Workflows Chart */}
      <Card>
        <h3 className="text-lg font-semibold text-[#F5F5F5] mb-4">Top 5 Workflows by Error Count</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={workflowData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
            <XAxis type="number" stroke="#8A8A8A" style={{ fontSize: '12px' }} />
            <YAxis
              dataKey="name"
              type="category"
              stroke="#8A8A8A"
              style={{ fontSize: '12px' }}
              width={200}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1A1A1A',
                border: '1px solid #333333',
                borderRadius: '0.375rem',
                color: '#F5F5F5',
              }}
            />
            <Bar dataKey="errors" fill="#E67514" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Error Breakdown Table */}
      <Card>
        <h3 className="text-lg font-semibold text-[#F5F5F5] mb-4">Error Breakdown</h3>
        <div className="bg-[#2A2A2A] border border-[#333333] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#252525] border-b border-[#333333]">
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#BEBEBE] uppercase tracking-wider">
                  Workflow Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#BEBEBE] uppercase tracking-wider">
                  Error Count
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#BEBEBE] uppercase tracking-wider">
                  Last Error
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#BEBEBE] uppercase tracking-wider">
                  Success Rate
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#BEBEBE] uppercase tracking-wider">
                  Avg Duration
                </th>
              </tr>
            </thead>
            <tbody>
              {analytics.topWorkflows.map((workflow, index) => (
                <tr
                  key={index}
                  className="border-b border-[#333333] hover:bg-[#2F2F2F] transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-[#F5F5F5]">{workflow.workflowName}</td>
                  <td className="px-6 py-4 text-sm text-[#F5F5F5]">{workflow.errorCount}</td>
                  <td className="px-6 py-4 text-sm text-[#F5F5F5]">
                    {format(workflow.lastError, 'MMM dd, yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#F5F5F5]">
                    {workflow.successRate.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 text-sm text-[#F5F5F5]">
                    {(workflow.avgDuration / 1000).toFixed(1)}s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

