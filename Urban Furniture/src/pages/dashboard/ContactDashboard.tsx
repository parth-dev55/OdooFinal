import { useAuth } from '../../contexts/AuthContext';
import Topbar from '../../components/dashboard/Topbar';
import Sidebar from '../../components/dashboard/Sidebar';
import KpiCard from '../../components/dashboard/KpiCard';
import { Receipt, FileSpreadsheet, Wallet, ArrowUpRight, Clock, CheckCircle2 } from 'lucide-react';

export default function ContactDashboard() {
  const { profile } = useAuth();

  const kpis = [
    { title: 'My Outstanding Bills', value: '$4,250.00', icon: <Clock className="w-5 h-5 text-orange-600" /> },
    { title: 'My Invoices', value: '12 Total', icon: <FileSpreadsheet className="w-5 h-5 text-blue-600" /> },
    { title: 'Payments Made', value: '$18,400.00', icon: <CheckCircle2 className="w-5 h-5 text-green-600" /> },
  ];

  const mockInvoices = [
    { id: '1', date: '2023-10-24', reference: 'INV-2023-001', amount: '$4,500.00', status: 'Paid' },
    { id: '4', date: '2023-10-20', reference: 'INV-2023-002', amount: '$8,900.00', status: 'Overdue' },
  ];

  const mockBills = [
    { id: '2', date: '2023-10-23', reference: 'BILL-23-992', amount: '$1,200.00', status: 'Pending' },
  ];

  const mockPayments = [
    { id: '3', date: '2023-10-21', reference: 'PAY-8823', amount: '$4,500.00', status: 'Completed' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': 
      case 'Completed': return 'bg-green-50 text-green-700 ring-green-600/20';
      case 'Pending': return 'bg-yellow-50 text-yellow-700 ring-yellow-600/20';
      case 'Overdue': return 'bg-red-50 text-red-700 ring-red-600/10';
      default: return 'bg-gray-50 text-gray-700 ring-gray-600/20';
    }
  };

  const TableTemplate = ({ title, data }: { title: string, data: any[] }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 bg-gray-50/50 uppercase border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Reference</th>
              <th className="px-6 py-4 font-medium text-right">Amount</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 text-gray-500">{row.date}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{row.reference}</td>
                <td className="px-6 py-4 text-right font-medium text-gray-900">{row.amount}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(row.status)}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50/50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8 scrollbar-thin">
          <div className="max-w-5xl mx-auto space-y-8">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome, {profile?.name || 'Contact'}</h1>
                <p className="text-gray-500 mt-2">Manage your invoices, bills, and payments here.</p>
              </div>
              <button className="flex items-center gap-2 bg-[#6D54B5] hover:bg-[#5a4596] text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm">
                <Wallet className="w-5 h-5" />
                Make Payment
              </button>
            </div>

            {/* KPIs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {kpis.map((kpi, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-500 text-sm font-medium">{kpi.title}</h3>
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                      {kpi.icon}
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{kpi.value}</div>
                </div>
              ))}
            </div>

            {/* Tables */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="space-y-8">
                <TableTemplate title="My Outstanding Bills" data={mockBills} />
                <TableTemplate title="Recent Payments Made" data={mockPayments} />
              </div>
              <div>
                <TableTemplate title="My Invoices" data={mockInvoices} />
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
