import { Plus, Users, Package, FileText, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const actions = [
  { name: 'Create Sale', icon: ArrowUpRight, color: 'text-green-600', bg: 'bg-green-50' },
  { name: 'Create Purchase', icon: ArrowDownRight, color: 'text-orange-600', bg: 'bg-orange-50' },
  { name: 'Record Payment', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
  { name: 'Add Contact', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  { name: 'Add Product', icon: Package, color: 'text-pink-600', bg: 'bg-pink-50' },
];

export default function QuickActions() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {actions.map((action) => (
          <button
            key={action.name}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:border-[#6D54B5]/30 hover:shadow-md transition-all group"
          >
            <div className={`w-12 h-12 rounded-full ${action.bg} ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <action.icon className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-gray-700 text-center">{action.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
