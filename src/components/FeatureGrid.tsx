import { ReactNode } from 'react';
import { Database, ShoppingCart, ShoppingBag, BarChart3, ArrowRight } from 'lucide-react';

export default function FeatureGrid() {
  return (
    <section className="py-24 px-6 lg:px-12 bg-white" id="features">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
          Urban Furniture Helps You Run Your Finance Smarter
        </h2>
        <p className="text-lg text-gray-500">
          Manage business data, transactions and accounting from one connected system.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <FeatureCard 
          icon={<Database className="w-6 h-6 text-[#6D54B5]" />}
          title="Centralized Master Data"
          description="Manage customers, vendors, products, accounts, journals and budgets in one place."
          visual={
            <div className="flex flex-col gap-2 p-4 bg-white rounded-xl border border-purple-100 shadow-sm mt-6">
              <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                <div className="w-24 h-2.5 bg-gray-200 rounded-full"></div>
                <div className="w-12 h-2.5 bg-purple-100 rounded-full"></div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-full bg-gray-100"></div>
                <div className="flex flex-col gap-1.5">
                  <div className="w-32 h-2 bg-gray-200 rounded-full"></div>
                  <div className="w-20 h-2 bg-gray-100 rounded-full"></div>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-full bg-gray-100"></div>
                <div className="flex flex-col gap-1.5">
                  <div className="w-28 h-2 bg-gray-200 rounded-full"></div>
                  <div className="w-16 h-2 bg-gray-100 rounded-full"></div>
                </div>
              </div>
            </div>
          }
        />
        
        <FeatureCard 
          icon={<ShoppingCart className="w-6 h-6 text-emerald-600" />}
          title="Sales Automation"
          description="Connect sales orders, customer invoices and payments in one seamless workflow."
          visual={
            <div className="flex items-center justify-between p-6 bg-white rounded-xl border border-gray-100 shadow-sm mt-6">
              <FlowBlock label="Order" color="bg-emerald-100 text-emerald-700" />
              <ArrowRight className="w-4 h-4 text-gray-300" />
              <FlowBlock label="Invoice" color="bg-blue-100 text-blue-700" />
              <ArrowRight className="w-4 h-4 text-gray-300" />
              <FlowBlock label="Payment" color="bg-purple-100 text-[#6D54B5]" />
            </div>
          }
        />

        <FeatureCard 
          icon={<ShoppingBag className="w-6 h-6 text-amber-600" />}
          title="Purchase Management"
          description="Connect purchase orders, vendor bills and payments without duplicate data entry."
          visual={
            <div className="flex items-center justify-between p-6 bg-white rounded-xl border border-gray-100 shadow-sm mt-6">
              <FlowBlock label="PO" color="bg-amber-100 text-amber-700" />
              <ArrowRight className="w-4 h-4 text-gray-300" />
              <FlowBlock label="Bill" color="bg-rose-100 text-rose-700" />
              <ArrowRight className="w-4 h-4 text-gray-300" />
              <FlowBlock label="Payment" color="bg-purple-100 text-[#6D54B5]" />
            </div>
          }
        />

        <FeatureCard 
          icon={<BarChart3 className="w-6 h-6 text-purple-600" />}
          title="Customizable Financial Dashboard"
          description="See revenue, expenses, profit, cash, receivables, payables and budget performance at a glance."
          visual={
            <div className="grid grid-cols-2 gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm mt-6">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="w-12 h-2 bg-gray-200 rounded-full mb-2"></div>
                <div className="w-20 h-4 bg-gray-800 rounded-full"></div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="w-12 h-2 bg-gray-200 rounded-full mb-2"></div>
                <div className="w-16 h-4 bg-emerald-600 rounded-full"></div>
              </div>
              <div className="col-span-2 bg-gray-50 rounded-lg h-12 border border-gray-100 flex items-end gap-1 px-2 pb-1">
                <div className="flex-1 bg-purple-200 rounded-t-sm h-[30%]"></div>
                <div className="flex-1 bg-purple-300 rounded-t-sm h-[50%]"></div>
                <div className="flex-1 bg-purple-400 rounded-t-sm h-[80%]"></div>
                <div className="flex-1 bg-[#6D54B5] rounded-t-sm h-[60%]"></div>
              </div>
            </div>
          }
        />
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, description, visual }: { icon: ReactNode, title: string, description: string, visual: ReactNode }) {
  return (
    <div className="p-8 rounded-3xl bg-gray-50/50 border border-gray-100 flex flex-col h-full hover:shadow-lg hover:border-gray-200 transition-all duration-300">
      <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed mb-4">{description}</p>
      <div className="mt-auto">
        {visual}
      </div>
    </div>
  );
}

function FlowBlock({ label, color }: { label: string, color: string }) {
  return (
    <div className={`px-3 py-2 rounded-lg text-xs font-semibold ${color}`}>
      {label}
    </div>
  );
}
