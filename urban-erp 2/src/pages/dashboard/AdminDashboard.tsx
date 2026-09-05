import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Topbar from '../../components/dashboard/Topbar';
import Sidebar from '../../components/dashboard/Sidebar';
import KpiCard from '../../components/dashboard/KpiCard';
import RecentTransactions from '../../components/dashboard/RecentTransactions';
import QuickActions from '../../components/dashboard/QuickActions';
import { SalesTrendChart, ExpenseBreakdownChart, BudgetActualChart } from '../../components/dashboard/Charts';
import { DollarSign, ShoppingCart, TrendingDown, PieChart, Activity, Wallet, Percent, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [summaryData, setSummaryData] = useState<any>(null);

  useEffect(() => {
    dashboardService.getSummary().then(setSummaryData);
  }, []);

  const kpis = [
    { title: 'Total Sales', value: summaryData?.totalSales?.value || '$0', icon: <ShoppingCart className="w-5 h-5" />, trend: summaryData?.totalSales?.trend, trendUp: summaryData?.totalSales?.trendUp },
    { title: 'Total Purchases', value: summaryData?.totalPurchases?.value || '$0', icon: <CreditCard className="w-5 h-5" />, trend: summaryData?.totalPurchases?.trend, trendUp: summaryData?.totalPurchases?.trendUp },
    { title: 'Total Expenses', value: summaryData?.totalExpenses?.value || '$0', icon: <TrendingDown className="w-5 h-5" />, trend: summaryData?.totalExpenses?.trend, trendUp: summaryData?.totalExpenses?.trendUp },
    { title: 'Net Profit', value: summaryData?.netProfit?.value || '$0', icon: <DollarSign className="w-5 h-5" />, trend: summaryData?.netProfit?.trend, trendUp: summaryData?.netProfit?.trendUp },
    { title: 'Receivables', value: summaryData?.receivables?.value || '$0', icon: <Activity className="w-5 h-5" /> },
    { title: 'Payables', value: summaryData?.payables?.value || '$0', icon: <Wallet className="w-5 h-5" /> },
    { title: 'Cash / Bank', value: summaryData?.cashBank?.value || '$0', icon: <PieChart className="w-5 h-5" /> },
    { title: 'Budget Utilization', value: summaryData?.budgetUtilization?.value || '0%', icon: <Percent className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50/50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8 scrollbar-thin">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Good morning, {profile?.name || 'User'}</h1>
              <p className="text-gray-500 mt-2">Here's your accounting overview.</p>
            </div>

            {/* Quick Actions */}
            <QuickActions />

            {/* KPIs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {kpis.map((kpi, idx) => (
                <KpiCard 
                  key={idx} 
                  title={kpi.title} 
                  value={kpi.value} 
                  icon={kpi.icon} 
                  trend={kpi.trend} 
                  trendUp={kpi.trendUp} 
                />
              ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SalesTrendChart />
              </div>
              <div className="lg:col-span-1">
                <ExpenseBreakdownChart />
              </div>
            </div>

            {/* Charts Row 2 & Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <BudgetActualChart />
                
                {/* Report Shortcuts */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Report Shortcuts</h3>
                  <div className="space-y-3">
                    <Link to="/reports/balance-sheet" className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-[#6D54B5]/30 hover:bg-purple-50/50 transition-colors group">
                      <span className="font-medium text-gray-700 group-hover:text-[#6D54B5]">Balance Sheet</span>
                      <PieChart className="w-4 h-4 text-gray-400 group-hover:text-[#6D54B5]" />
                    </Link>
                    <Link to="/reports/profit-loss" className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-[#6D54B5]/30 hover:bg-purple-50/50 transition-colors group">
                      <span className="font-medium text-gray-700 group-hover:text-[#6D54B5]">Profit & Loss</span>
                      <Activity className="w-4 h-4 text-gray-400 group-hover:text-[#6D54B5]" />
                    </Link>
                    <Link to="/reports/budget" className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-[#6D54B5]/30 hover:bg-purple-50/50 transition-colors group">
                      <span className="font-medium text-gray-700 group-hover:text-[#6D54B5]">Budget Report</span>
                      <Percent className="w-4 h-4 text-gray-400 group-hover:text-[#6D54B5]" />
                    </Link>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2">
                <RecentTransactions />
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
