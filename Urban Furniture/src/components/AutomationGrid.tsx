import { ReactNode } from 'react';
import { RefreshCw, Activity, Settings, TrendingUp } from 'lucide-react';

export default function AutomationGrid() {
  return (
    <section className="py-24 px-6 lg:px-12 bg-white" id="transactions">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
          Run Your Accounting on Autopilot
        </h2>
        <p className="text-lg text-gray-500">
          Connect transactions, accounting rules and reporting into one consistent workflow.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AutomationCard 
          icon={<RefreshCw className="w-5 h-5 text-blue-600" />}
          title="Connect Every Transaction"
          description="Keep sales, purchases, invoices and payments connected."
          visual={
            <div className="h-32 flex flex-col justify-center gap-3 bg-blue-50/50 rounded-t-2xl p-6 border-b border-gray-100">
              <div className="flex items-center justify-between bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                <span className="text-xs font-medium text-gray-600">Sales</span>
                <span className="text-xs font-bold text-emerald-600">+$1,250</span>
              </div>
              <div className="flex items-center justify-between bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                <span className="text-xs font-medium text-gray-600">Vendor</span>
                <span className="text-xs font-bold text-rose-600">-$420</span>
              </div>
            </div>
          }
        />
        
        <AutomationCard 
          icon={<Activity className="w-5 h-5 text-[#6D54B5]" />}
          title="Track Every Financial Event"
          description="Maintain accurate journal entries and ledger updates."
          visual={
            <div className="h-32 flex items-center justify-center bg-purple-50/50 rounded-t-2xl p-6 border-b border-gray-100">
               <svg className="w-full h-12" viewBox="0 0 100 30" preserveAspectRatio="none">
                 <path d="M0,20 Q10,5 20,20 T40,15 T60,25 T80,10 T100,20" fill="none" stroke="#6D54B5" strokeWidth="2" strokeLinecap="round" />
                 <path d="M0,20 Q10,5 20,20 T40,15 T60,25 T80,10 T100,20 L100,30 L0,30 Z" fill="url(#purple-grad)" stroke="none" opacity="0.2" />
                 <defs>
                   <linearGradient id="purple-grad" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor="#6D54B5" />
                     <stop offset="100%" stopColor="white" />
                   </linearGradient>
                 </defs>
               </svg>
            </div>
          }
        />

        <AutomationCard 
          icon={<Settings className="w-5 h-5 text-purple-600" />}
          title="Automate Accounting Logic"
          description="Validate data, calculate taxes and maintain balanced accounting entries."
          visual={
            <div className="h-32 flex items-center justify-center bg-purple-50/50 rounded-t-2xl p-6 border-b border-gray-100 relative overflow-hidden">
               <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-sm border border-gray-100 z-10">
                 <span className="text-xl font-bold text-purple-600">DR</span>
               </div>
               <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-sm border border-gray-100 -ml-4 z-0">
                 <span className="text-xl font-bold text-gray-400">CR</span>
               </div>
            </div>
          }
        />

        <AutomationCard 
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          title="Optimize Financial Control"
          description="Monitor budgets, expenses and profitability from one place."
          visual={
            <div className="h-32 flex items-end justify-center gap-2 bg-emerald-50/50 rounded-t-2xl p-6 border-b border-gray-100">
               <div className="w-6 bg-emerald-200 rounded-t-md h-[40%]"></div>
               <div className="w-6 bg-emerald-300 rounded-t-md h-[60%]"></div>
               <div className="w-6 bg-emerald-400 rounded-t-md h-[50%]"></div>
               <div className="w-6 bg-emerald-500 rounded-t-md h-[80%]"></div>
               <div className="w-6 bg-emerald-600 rounded-t-md h-[100%]"></div>
            </div>
          }
        />
      </div>
    </section>
  );
}

function AutomationCard({ icon, title, description, visual }: { icon: ReactNode, title: string, description: string, visual: ReactNode }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {visual}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-3">
          {icon}
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
