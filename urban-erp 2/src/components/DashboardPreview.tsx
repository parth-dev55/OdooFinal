import { ReactNode } from 'react';
import { LayoutDashboard, Receipt, ShoppingCart, CreditCard, FileText, PieChart, Search, Bell, Menu } from 'lucide-react';

export default function DashboardPreview() {
  return (
    <div className="rounded-2xl border-4 border-slate-800 bg-slate-900 shadow-2xl overflow-hidden flex flex-col w-full text-left mx-auto">
      {/* Top Bar */}
      <div className="h-14 border-b border-slate-800 flex items-center justify-between px-4 lg:px-6 bg-slate-900">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <div className="h-3 w-3 rounded-full bg-red-400"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
            <div className="h-3 w-3 rounded-full bg-green-400"></div>
          </div>
          <span className="font-bold text-white text-lg hidden sm:block ml-2">Executive Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center bg-slate-800 rounded-md px-3 py-1.5 text-gray-400">
            <Search className="w-4 h-4 mr-2" />
            <span className="text-xs">Search transactions, invoices...</span>
          </div>
          <button className="text-gray-400 hover:text-gray-200 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-[#6D54B5] rounded-full border border-slate-900"></span>
          </button>
          <div className="w-7 h-7 rounded-full bg-slate-700 border border-slate-600"></div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-16 lg:w-64 border-r border-slate-800 bg-slate-900 p-4 flex flex-col gap-6 hidden sm:flex">
          <div className="flex flex-col gap-2">
            <NavItem icon={<LayoutDashboard className="w-5 h-5" />} label="Overview" active />
            <NavItem icon={<ShoppingCart className="w-5 h-5" />} label="Sales" />
            <NavItem icon={<Receipt className="w-5 h-5" />} label="Purchases" />
            <NavItem icon={<CreditCard className="w-5 h-5" />} label="Payments" />
            <NavItem icon={<FileText className="w-5 h-5" />} label="Accounting" />
            <NavItem icon={<PieChart className="w-5 h-5" />} label="Reports" />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-slate-900 p-4 lg:p-8">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h2 className="text-xl font-bold text-white">Financial Overview</h2>
              <p className="text-sm text-gray-400">Real-time accounting metrics</p>
            </div>
            <select className="text-sm border border-slate-700 rounded-md px-3 py-1.5 bg-slate-800 text-white shadow-sm outline-none">
              <option>This Month</option>
              <option>Last Quarter</option>
              <option>This Year</option>
            </select>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricCard title="Total Revenue" amount="$124,500" trend="+12.5%" positive />
            <MetricCard title="Total Expenses" amount="$82,300" trend="-2.4%" positive={false} />
            <MetricCard title="Net Profit" amount="$42,200" trend="+8.1%" positive />
            <MetricCard title="Receivables" amount="$18,400" trend="4 Pending" positive={false} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Area */}
            <div className="lg:col-span-2 bg-slate-800/50 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-white mb-4">Budget vs Actual</h3>
              <div className="h-48 flex items-end justify-between gap-2 px-2 pb-2">
                {[40, 70, 45, 90, 65, 85, 100].map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2 group">
                    <div className="w-full bg-slate-700 rounded-t-sm relative flex items-end">
                      <div 
                        className="w-full bg-[#6D54B5] rounded-t-sm transition-all duration-500 group-hover:bg-purple-400" 
                        style={{ height: `${val}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between px-2 pt-2 border-t border-slate-700/50 text-xs text-gray-400">
                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-slate-800/50 rounded-xl p-5 shadow-sm">
              <h3 className="text-xs text-gray-400 mb-4 font-semibold">Recent Transactions</h3>
              <div className="flex flex-col gap-4">
                <TransactionRow name="Modern Sofa Ltd" type="Sales Invoice" amount="+$4,200" status="Paid" />
                <TransactionRow name="Wood Suppliers Inc" type="Vendor Bill" amount="-$1,850" status="Pending" />
                <TransactionRow name="Office Rent" type="Journal Entry" amount="-$2,500" status="Posted" />
                <TransactionRow name="Design Services" type="Customer Payment" amount="+$950" status="Paid" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: ReactNode, label: string, active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer ${active ? 'bg-slate-800 text-[#6D54B5] shadow-sm' : 'text-gray-400 hover:bg-slate-800 hover:text-white'}`}>
      {icon}
      <span className="text-sm font-medium lg:block hidden">{label}</span>
    </div>
  );
}

function MetricCard({ title, amount, trend, positive }: { title: string, amount: string, trend: string, positive: boolean }) {
  return (
    <div className="bg-slate-800 p-4 rounded-xl">
      <p className="text-[10px] text-gray-400 uppercase mb-1">{title}</p>
      <div className="flex items-end justify-between">
        <h4 className="text-xl lg:text-2xl font-bold text-white">{amount}</h4>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${positive ? 'bg-green-400/10 text-green-400' : 'bg-yellow-400/10 text-yellow-400'}`}>
          {trend}
        </span>
      </div>
    </div>
  );
}

function TransactionRow({ name, type, amount, status }: { name: string, type: string, amount: string, status: string }) {
  const isPositive = amount.startsWith('+');
  return (
    <div className="flex justify-between text-[11px] py-2 border-b border-slate-700/50 last:border-0">
      <div className="flex flex-col">
        <span className="text-white">{name}</span>
        <span className="text-gray-500 text-[9px]">{type}</span>
      </div>
      <div className="flex flex-col items-end">
        <span className={isPositive ? 'text-green-400' : 'text-red-400'}>{amount}</span>
        <span className="text-gray-500 text-[9px]">{status}</span>
      </div>
    </div>
  );
}
