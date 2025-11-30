import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({ icon: Icon, value, label, trend }) => {
  return (
    <div className="bg-[#2A2A2A] border border-[#333333] rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
      <div className="bg-[rgba(230,117,20,0.1)] text-[#E67514] w-10 h-10 p-3 rounded-md mb-4 flex items-center justify-center">
        <Icon size={20} />
      </div>
      <div className="text-[#F5F5F5] text-3xl font-bold leading-tight mb-2">{value}</div>
      <div className="text-[#BEBEBE] text-sm mb-2">{label}</div>
      {trend && (
        <div className="mt-2">
          <Badge variant={trend.isPositive ? 'success' : 'error'}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </Badge>
        </div>
      )}
    </div>
  );
};

