import { ArrowDown } from 'lucide-react';

export default function WorkflowSection() {
  return (
    <section className="py-24 px-6 lg:px-12 bg-white" id="accounting">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">Real Workflows</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Built Around Real Accounting Workflows
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Designed around the complete journey from business transaction to financial reporting.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-stretch justify-center">
          {/* Left: Workflow Visual */}
          <div className="flex-1 max-w-lg bg-gray-50 rounded-3xl border border-gray-200 p-8 flex flex-col items-center justify-center">
             <WorkflowStep label="Sales Order" color="bg-emerald-100 text-emerald-800" />
             <ArrowDown className="w-5 h-5 text-gray-400 my-2" />
             <WorkflowStep label="Customer Invoice" color="bg-blue-100 text-blue-800" />
             <ArrowDown className="w-5 h-5 text-gray-400 my-2" />
             <WorkflowStep label="Payment" color="bg-purple-100 text-[#6D54B5]" />
             <ArrowDown className="w-5 h-5 text-gray-400 my-2" />
             <WorkflowStep label="Journal Entry" color="bg-purple-200 text-purple-900" />
             <ArrowDown className="w-5 h-5 text-gray-400 my-2" />
             <WorkflowStep label="Ledger" color="bg-rose-100 text-rose-800" />
             <ArrowDown className="w-5 h-5 text-gray-400 my-2" />
             <WorkflowStep label="P&L / Balance Sheet" color="bg-gray-900 text-white" />
          </div>

          {/* Right: KPIs */}
          <div className="flex-1 max-w-md grid grid-cols-2 gap-4 place-content-center">
             <KpiCard label="Revenue" sub="Track top-line growth" />
             <KpiCard label="Net Profit" sub="Bottom-line visibility" />
             <KpiCard label="Receivables" sub="Cash flow control" />
             <KpiCard label="Budget Utilization" sub="Expense management" />
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkflowStep({ label, color }: { label: string, color: string }) {
  return (
    <div className={`w-full max-w-xs text-center py-3 px-6 rounded-xl font-bold shadow-sm border border-white/20 ${color}`}>
      {label}
    </div>
  );
}

function KpiCard({ label, sub }: { label: string, sub: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-center text-center aspect-square hover:border-purple-200 hover:shadow-md transition-all">
      <h3 className="font-bold text-gray-900 text-lg mb-2">{label}</h3>
      <p className="text-sm text-gray-500">{sub}</p>
    </div>
  );
}
