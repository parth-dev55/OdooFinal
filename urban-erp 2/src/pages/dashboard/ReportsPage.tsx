import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  BarChart, 
  FileText, 
  PieChart, 
  TrendingUp, 
  Calendar, 
  ArrowRight, 
  Filter, 
  Clock, 
  ShieldCheck, 
  Layers, 
  CheckCircle2 
} from 'lucide-react';
import Sidebar from '../../components/dashboard/Sidebar';
import Topbar from '../../components/dashboard/Topbar';
import { useAuth } from '../../contexts/AuthContext';

export const ReportsPage: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Period Filter States
  const today = new Date().toISOString().split('T')[0];
  const startOfYear = `${new Date().getFullYear()}-01-01`;
  const [fromDate, setFromDate] = useState<string>(startOfYear);
  const [toDate, setToDate] = useState<string>(today);
  const [appliedPeriod, setAppliedPeriod] = useState<{ from: string; to: string }>({
    from: startOfYear,
    to: today,
  });

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedPeriod({ from: fromDate, to: toDate });
  };

  const reportCards = [
    {
      id: 'balance-sheet',
      title: 'Balance Sheet',
      route: `/reports/balance-sheet?from=${appliedPeriod.from}&to=${appliedPeriod.to}`,
      description: "View the company's financial position, current assets (cash, bank, debtors), liabilities, and capital equity.",
      icon: Layers,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      badge: 'Statement of Financial Position',
      lastGenerated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    },
    {
      id: 'profit-loss',
      title: 'Profit & Loss',
      route: `/reports/profit-loss?from=${appliedPeriod.from}&to=${appliedPeriod.to}`,
      description: "Understand operational sales revenue, purchase expenses, operating overheads, and net profit margins.",
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      badge: 'Income Statement',
      lastGenerated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    },
    {
      id: 'budget-report',
      title: 'Budget Report',
      route: `/reports/budget?from=${appliedPeriod.from}&to=${appliedPeriod.to}`,
      description: "Compare defined financial plans against actual business activity, remaining headroom, and utilization percentages.",
      icon: PieChart,
      color: 'text-[#6D54B5]',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-100',
      badge: 'Variance & Utilization',
      lastGenerated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
  ];

  return (
    <div className="flex h-screen bg-[#FDFBF7] font-sans antialiased text-gray-900 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Reports
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Get a clear view of your financial position and business performance.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-white px-3.5 py-2 rounded-xl border border-gray-200 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Double-entry verified from posted journal records</span>
            </div>
          </div>

          {/* Period Filter Bar */}
          <form 
            onSubmit={handleApplyFilters}
            className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-4"
          >
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-bold text-gray-700">Reporting Period:</span>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-[11px] font-semibold text-gray-500">From Date:</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-[11px] font-semibold text-gray-500">To Date:</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-[#6D54B5] hover:bg-[#5B4599] text-white px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Apply Filters</span>
            </button>
          </form>

          {/* 3 Large Report Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {reportCards.map((card) => {
              const IconComponent = card.icon;
              return (
                <div
                  key={card.id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition-all p-6 flex flex-col justify-between group"
                >
                  <div>
                    {/* Icon & Category Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl ${card.bgColor} ${card.color} flex items-center justify-center shadow-xs`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                        {card.badge}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-lg font-black text-gray-900 group-hover:text-[#6D54B5] transition-colors mb-2">
                      {card.title}
                    </h2>

                    {/* Short Description */}
                    <p className="text-xs text-gray-500 leading-relaxed min-h-[48px]">
                      {card.description}
                    </p>
                  </div>

                  {/* Card Bottom Meta & Button */}
                  <div className="pt-6 mt-6 border-t border-gray-100 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Generated:
                      </span>
                      <span className="font-medium text-gray-600">{card.lastGenerated}</span>
                    </div>

                    <button
                      onClick={() => navigate(card.route)}
                      className="w-full py-2.5 px-4 bg-gray-50 hover:bg-[#6D54B5] hover:text-white text-gray-700 text-xs font-bold rounded-xl border border-gray-200 hover:border-transparent transition-all flex items-center justify-center gap-2 group-hover:shadow-xs"
                    >
                      <span>View Report</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Compliance & Audit Notes */}
          <div className="p-4 bg-gray-50/70 border border-gray-200/80 rounded-2xl flex items-center gap-3 text-xs text-gray-500">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              All financial reports calculate totals from authoritative posted transactions, accounts payable, accounts receivable, and chart of accounts. Draft accounting entries are excluded to guarantee audited integrity.
            </span>
          </div>
        </main>
      </div>
    </div>
  );
};
export default ReportsPage;
