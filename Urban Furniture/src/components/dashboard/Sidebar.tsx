import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText, 
  BookOpen,
  ShoppingCart,
  CreditCard,
  FileSpreadsheet,
  Wallet,
  TrendingUp,
  PieChart,
  BarChart,
  ChevronLeft,
  ChevronRight,
  Receipt
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { profile } = useAuth();

  const isAdminOrAccountant = profile?.role === 'ADMIN' || profile?.role === 'ACCOUNTANT';

  const menuGroups = [
    {
      title: "OVERVIEW",
      show: true,
      items: [
        { name: 'Dashboard', icon: LayoutDashboard, path: isAdminOrAccountant ? '/dashboard' : '/contact/dashboard' }
      ]
    },
    {
      title: "MASTER DATA",
      show: isAdminOrAccountant,
      items: [
        { name: 'Contacts', icon: Users, path: '/dashboard/contacts' },
        { name: 'Products', icon: Package, path: '/dashboard/products' },
        { name: 'Chart of Accounts', icon: FileText, path: '/dashboard/accounts' },
        { name: 'Journals', icon: BookOpen, path: '/dashboard/journals' }
      ]
    },
    {
      title: "TRANSACTIONS",
      show: isAdminOrAccountant,
      items: [
        { name: 'Sales', icon: ShoppingCart, path: '/dashboard/sales' },
        { name: 'Purchases', icon: CreditCard, path: '/dashboard/purchases' },
        { name: 'Invoices', icon: FileSpreadsheet, path: '/dashboard/invoices' },
        { name: 'Bills', icon: Receipt, path: '/dashboard/bills' },
        { name: 'Payments', icon: Wallet, path: '/dashboard/payments' }
      ]
    },
    {
      title: "ACCOUNTING",
      show: isAdminOrAccountant,
      items: [
        { name: 'Journal Entries', icon: BookOpen, path: '/dashboard/journal-entries' },
        { name: 'Ledger', icon: FileText, path: '/dashboard/ledger' }
      ]
    },
    {
      title: "BUDGET",
      show: isAdminOrAccountant,
      items: [
        { name: 'Budget', icon: TrendingUp, path: '/dashboard/budget' }
      ]
    },
    {
      title: "REPORTS",
      show: isAdminOrAccountant,
      items: [
        { name: 'Balance Sheet', icon: PieChart, path: '/dashboard/balance-sheet' },
        { name: 'Profit & Loss', icon: BarChart, path: '/dashboard/profit-loss' },
        { name: 'Budget Report', icon: TrendingUp, path: '/dashboard/budget-report' }
      ]
    },
    {
      title: "MY BILLING",
      show: profile?.role === 'CONTACT',
      items: [
        { name: 'My Invoices', icon: FileSpreadsheet, path: '/contact/invoices' },
        { name: 'My Bills', icon: Receipt, path: '/contact/bills' },
        { name: 'My Payments', icon: Wallet, path: '/contact/payments' }
      ]
    }
  ];

  return (
    <aside className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${collapsed ? 'w-20' : 'w-64'} h-screen sticky top-0`}>
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6D54B5] to-[#FF8C61] flex items-center justify-center text-white font-bold text-lg">
              U
            </div>
            <span className="font-bold text-lg text-gray-900 tracking-tight">Urban ERP</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6D54B5] to-[#FF8C61] flex items-center justify-center text-white font-bold text-lg mx-auto">
            U
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-500 hover:bg-gray-100 p-1.5 rounded-lg transition-colors absolute -right-3 top-5 bg-white border border-gray-200 shadow-sm"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        {menuGroups.filter(g => g.show).map((group, idx) => (
          <div key={idx} className="mb-6">
            {!collapsed && (
              <h3 className="px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {group.title}
              </h3>
            )}
            <nav className="space-y-1 px-3">
              {group.items.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-purple-50 text-[#6D54B5] font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } ${collapsed ? 'justify-center' : ''}`
                  }
                  title={collapsed ? item.name : undefined}
                >
                  <item.icon className={`w-5 h-5 ${collapsed ? '' : 'flex-shrink-0'}`} />
                  {!collapsed && <span>{item.name}</span>}
                </NavLink>
              ))}
            </nav>
          </div>
        ))}
      </div>
    </aside>
  );
}
