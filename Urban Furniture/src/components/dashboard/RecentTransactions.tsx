import { useState, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';

interface Transaction {
  id: string;
  date: string;
  reference: string;
  type: string;
  party: string;
  amount: string;
  status: 'Paid' | 'Pending' | 'Overdue';
}

export default function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    dashboardService.getRecentTransactions().then(setTransactions);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-50 text-green-700 ring-green-600/20';
      case 'Pending': return 'bg-yellow-50 text-yellow-700 ring-yellow-600/20';
      case 'Overdue': return 'bg-red-50 text-red-700 ring-red-600/10';
      default: return 'bg-gray-50 text-gray-700 ring-gray-600/20';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
        <button className="text-[#6D54B5] text-sm font-semibold hover:text-purple-700">View All</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 bg-gray-50/50 uppercase border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Reference</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Party</th>
              <th className="px-6 py-4 font-medium text-right">Amount</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4 text-gray-500">{tx.date}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{tx.reference}</td>
                <td className="px-6 py-4 text-gray-500">{tx.type}</td>
                <td className="px-6 py-4 text-gray-900">{tx.party}</td>
                <td className="px-6 py-4 text-right font-medium text-gray-900">{tx.amount}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(tx.status)}`}>
                    {tx.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
