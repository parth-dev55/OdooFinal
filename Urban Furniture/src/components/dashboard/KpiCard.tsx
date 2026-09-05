import { ReactNode } from 'react';

interface KpiCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export default function KpiCard({ title, value, icon, trend, trendUp }: KpiCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6D54B5] flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {trend && (
          <div className={`text-xs font-semibold px-2 py-1 rounded-md ${
            trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            {trendUp ? '+' : '-'}{trend}
          </div>
        )}
      </div>
    </div>
  );
}
