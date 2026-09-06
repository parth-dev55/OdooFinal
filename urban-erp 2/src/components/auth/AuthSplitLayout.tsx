import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export default function AuthSplitLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 flex flex-col lg:flex-row bg-gray-50 min-h-screen">
      
      {/* Left Column - Marketing / Workflow */}
      <div className="hidden lg:flex flex-col w-1/2 p-12 xl:p-20 justify-center relative overflow-hidden bg-white border-r border-gray-100">
        
        {/* Decorative Gradients (reused from landing page style) */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-400/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative z-10 max-w-lg mx-auto">
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-10 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-[#6D54B5] rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm rotate-45"></div>
              </div>
              <div>
                <p className="font-bold text-gray-900 leading-tight">Urban Furniture</p>
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tighter">Accounting ERP</p>
              </div>
            </Link>
          </div>

          <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-[#6D54B5] text-xs font-bold tracking-wide uppercase mb-6">
            Enterprise Accounting ERP
          </div>
          
          <h1 className="text-4xl xl:text-5xl font-bold text-gray-900 leading-tight mb-6 tracking-tight">
            Manage your sales, purchases and accounting from one connected system.
          </h1>
          
          <p className="text-gray-600 text-lg leading-relaxed mb-12">
            Connect business transactions with invoices, payments, journals, ledgers and financial reports in one accounting workflow.
          </p>

          {/* Workflow Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-purple-900/5 p-6 space-y-6 relative">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Connected Accounting Flow</h3>
            
            <div className="space-y-4 relative">
              {/* Vertical connector line */}
              <div className="absolute left-[15px] top-4 bottom-4 w-px bg-purple-100" />
              
              <WorkflowStep num="01" title="Sales Order" desc="Customer + Product" />
              <WorkflowStep num="02" title="Customer Invoice" desc="Invoice generated from transaction" />
              <WorkflowStep num="03" title="Payment" desc="Cash / Bank payment recorded" />
              <WorkflowStep num="04" title="Journal Entry" desc="Debit / Credit posted" />
              <WorkflowStep num="05" title="Ledger & Reports" desc="Financial records updated" />
            </div>

            <div className="flex flex-wrap gap-2 pt-4 mt-4 border-t border-gray-50">
              <span className="px-2 py-1 bg-gray-50 text-gray-500 rounded text-xs font-medium border border-gray-100">Role-Based Access</span>
              <span className="px-2 py-1 bg-gray-50 text-gray-500 rounded text-xs font-medium border border-gray-100">Secure Authentication</span>
              <span className="px-2 py-1 bg-gray-50 text-gray-500 rounded text-xs font-medium border border-gray-100">Connected Accounting</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Auth Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 z-10 relative">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}

function WorkflowStep({ num, title, desc }: { num: string, title: string, desc: string }) {
  return (
    <div className="flex items-start gap-4 relative z-10">
      <div className="w-8 h-8 rounded-full bg-purple-50 text-[#6D54B5] flex items-center justify-center text-xs font-bold border border-purple-100 shrink-0">
        {num}
      </div>
      <div>
        <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
