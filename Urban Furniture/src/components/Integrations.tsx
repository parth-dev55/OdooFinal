import { ReactNode } from 'react';
import { Users, Package, ShoppingCart, ShoppingBag, CreditCard, FileText, Target, PieChart } from 'lucide-react';

export default function Integrations() {
  const topNodes = [
    { label: 'Contacts', icon: <Users className="w-6 h-6 text-[#6D54B5]" /> },
    { label: 'Products', icon: <Package className="w-6 h-6 text-blue-600" /> },
    { label: 'Sales', icon: <ShoppingCart className="w-6 h-6 text-emerald-600" /> },
    { label: 'Purchases', icon: <ShoppingBag className="w-6 h-6 text-amber-600" /> },
  ];

  const bottomNodes = [
    { label: 'Payments', icon: <CreditCard className="w-6 h-6 text-rose-600" /> },
    { label: 'Accounting', icon: <FileText className="w-6 h-6 text-purple-600" /> },
    { label: 'Budget', icon: <Target className="w-6 h-6 text-cyan-600" /> },
    { label: 'Reports', icon: <PieChart className="w-6 h-6 text-fuchsia-600" /> },
  ];

  return (
    <section className="py-24 px-6 lg:px-12 bg-white relative overflow-hidden flex flex-col items-center">
      
      {/* Background SVG Lines (Decorative) */}
      <div className="absolute inset-0 z-0 hidden md:block opacity-30 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
           {/* Simple curved lines pointing towards the center */}
           <path d="M 20% 20% Q 50% 10% 50% 50%" stroke="#e5e7eb" strokeWidth="2" fill="none" />
           <path d="M 40% 20% Q 50% 30% 50% 50%" stroke="#e5e7eb" strokeWidth="2" fill="none" />
           <path d="M 60% 20% Q 50% 30% 50% 50%" stroke="#e5e7eb" strokeWidth="2" fill="none" />
           <path d="M 80% 20% Q 50% 10% 50% 50%" stroke="#e5e7eb" strokeWidth="2" fill="none" />
           
           <path d="M 20% 80% Q 50% 90% 50% 50%" stroke="#e5e7eb" strokeWidth="2" fill="none" />
           <path d="M 40% 80% Q 50% 70% 50% 50%" stroke="#e5e7eb" strokeWidth="2" fill="none" />
           <path d="M 60% 80% Q 50% 70% 50% 50%" stroke="#e5e7eb" strokeWidth="2" fill="none" />
           <path d="M 80% 80% Q 50% 90% 50% 50%" stroke="#e5e7eb" strokeWidth="2" fill="none" />
        </svg>
      </div>

      <div className="max-w-4xl mx-auto flex flex-col items-center gap-12 z-10 relative">
        
        {/* Top Row */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          {topNodes.map((node, i) => (
            <IntegrationNode key={i} label={node.label} icon={node.icon} />
          ))}
        </div>

        {/* Center */}
        <div className="text-center bg-purple-100 rounded-full py-2 px-6 shadow-sm border border-purple-200">
           <span className="text-sm font-bold text-[#6D54B5]">Urban Furniture Accounting</span>
        </div>

        {/* Bottom Row */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          {bottomNodes.map((node, i) => (
            <IntegrationNode key={i} label={node.label} icon={node.icon} />
          ))}
        </div>

      </div>

      <div className="text-center mt-16 max-w-2xl mx-auto z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
          Works Seamlessly With Your Business Workflow
        </h2>
        <p className="text-lg text-gray-500">
          One connected financial system.
        </p>
        <button className="mt-8 px-6 py-2.5 rounded-full border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm">
          Explore Architecture
        </button>
      </div>
    </section>
  );
}

function IntegrationNode({ label, icon }: { label: string, icon: ReactNode }) {
  return (
    <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center gap-2 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer">
      {icon}
      <span className="text-[10px] md:text-xs font-semibold text-gray-600">{label}</span>
    </div>
  );
}
