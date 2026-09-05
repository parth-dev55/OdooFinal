import { Clock } from 'lucide-react';

export default function ResourceCards() {
  return (
    <section className="py-24 px-6 lg:px-12 bg-white" id="resources">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">Insights</p>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
          Financial Intelligence for Modern Teams
        </h2>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <ResourceCard 
          category="Financial Reports"
          title="Understanding Profit & Loss"
          description="See how sales, purchases and expenses affect profitability."
          readTime="4 min read"
          gradient="from-purple-100 to-fuchsia-100"
        />
        <ResourceCard 
          category="Accounting Logic"
          title="Why Double-Entry Accounting Matters"
          description="Understand how balanced debit and credit entries maintain reliable financial records."
          readTime="6 min read"
          gradient="from-emerald-100 to-teal-100"
        />
        <ResourceCard 
          category="Financial Control"
          title="Budget vs Actual"
          description="Track planned spending against real business activity."
          readTime="5 min read"
          gradient="from-amber-100 to-orange-100"
        />
      </div>
    </section>
  );
}

function ResourceCard({ 
  category, 
  title, 
  description, 
  readTime,
  gradient 
}: { 
  category: string, 
  title: string, 
  description: string, 
  readTime: string,
  gradient: string 
}) {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col group cursor-pointer">
      {/* Visual Placeholder (Abstract Gradient instead of Stock Photo) */}
      <div className={`h-48 w-full bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}>
         <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_white_10%,_transparent_70%)]"></div>
         <div className="px-4 py-2 bg-white/50 backdrop-blur-md rounded-lg border border-white/60 shadow-sm">
           <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">{category}</span>
         </div>
      </div>
      
      <div className="p-8 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#6D54B5] transition-colors">
          {title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          {description}
        </p>
        <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-100">
          <button className="text-sm font-semibold text-gray-900 border border-gray-200 px-4 py-1.5 rounded-full hover:bg-gray-50">
            Read Article
          </button>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
            <Clock className="w-3.5 h-3.5" />
            {readTime}
          </div>
        </div>
      </div>
    </div>
  );
}
