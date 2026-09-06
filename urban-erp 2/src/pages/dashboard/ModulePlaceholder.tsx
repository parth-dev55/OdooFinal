import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import Topbar from '../../components/dashboard/Topbar';
import { ArrowLeft, Clock, Sparkles } from 'lucide-react';

interface ModulePlaceholderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  category?: string;
  expectedFeatures?: string[];
}

export default function ModulePlaceholder({
  title,
  description = `${title} module coming next.`,
  icon,
  category = 'ERP Module',
  expectedFeatures = []
}: ModulePlaceholderProps) {
  return (
    <div className="flex h-screen bg-gray-50/50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8 scrollbar-thin">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Header / Breadcrumb */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  <Link to="/dashboard" className="hover:text-[#6D54B5] transition-colors">Dashboard</Link>
                  <span>/</span>
                  <span className="text-[#6D54B5]">{category}</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                  {title}
                </h1>
                <p className="text-gray-500 mt-1">{description}</p>
              </div>

              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm self-start sm:self-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
            </div>

            {/* Main Placeholder Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-12 text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-purple-50 text-[#6D54B5] flex items-center justify-center mb-6 shadow-inner ring-8 ring-purple-50/50">
                {icon ? (
                  icon
                ) : (
                  <Sparkles className="w-8 h-8" />
                )}
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 mb-4">
                <Clock className="w-3.5 h-3.5" />
                Coming Next
              </span>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">{title} Module</h2>
              <p className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed mb-8">
                {description}
              </p>

              {expectedFeatures.length > 0 && (
                <div className="max-w-xl mx-auto mb-8 text-left bg-gray-50/80 rounded-xl p-6 border border-gray-100">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Planned Features</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {expectedFeatures.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#6D54B5]"></div>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-gray-100 flex items-center justify-center gap-4">
                <Link
                  to="/dashboard"
                  className="px-6 py-2.5 rounded-xl bg-[#6D54B5] text-white text-sm font-semibold hover:bg-purple-700 transition-colors shadow-md shadow-purple-200"
                >
                  Return to Dashboard
                </Link>
              </div>
            </div>

            {/* Skeleton / Preview Cards representing empty state */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
                <div className="h-8 bg-gray-100 rounded w-2/3 mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse"></div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
                <div className="h-8 bg-gray-100 rounded w-2/3 mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse"></div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
                <div className="h-8 bg-gray-100 rounded w-2/3 mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse"></div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
