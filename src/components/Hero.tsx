import DashboardPreview from './DashboardPreview';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="pt-16 pb-20 px-6 lg:px-12 text-center bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 mb-8">
          <span className="text-[10px] font-bold text-[#6D54B5] tracking-widest uppercase">Accounting ERP for Modern Businesses</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
          Smarter Accounting.<br />
          Connected Business.<br />
          Complete Financial Visibility.
        </h1>
        
        <p className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Connect sales, purchases, invoices, payments and accounting records in one intelligent workflow.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-20">
          <button className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#6D54B5] text-white font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200">
            Get Started
          </button>
          <button className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-gray-50 text-gray-700 font-bold border border-gray-200 hover:border-gray-300 transition-colors flex items-center justify-center gap-2">
            View Demo <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <DashboardPreview />
      </div>
    </section>
  );
}
