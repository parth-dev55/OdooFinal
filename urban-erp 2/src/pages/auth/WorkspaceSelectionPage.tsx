import { Link } from 'react-router-dom';
import { Building2, Calculator, Users, ArrowRight } from 'lucide-react';
import AuthSplitLayout from '../../components/auth/AuthSplitLayout';

export default function WorkspaceSelectionPage() {
  return (
    <AuthSplitLayout>
      <div className="bg-white rounded-3xl p-8 md:p-10 border border-gray-100 shadow-xl shadow-purple-900/5">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Choose your workspace</h2>
          <p className="text-gray-500 text-sm">Select the portal you want to access</p>
        </div>

        <div className="space-y-4">
          <Link 
            to="/login?workspace=admin" 
            className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 hover:border-[#6D54B5]/30 hover:bg-purple-50/50 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0 group-hover:bg-[#6D54B5] transition-colors">
              <Building2 className="w-5 h-5 text-[#6D54B5] group-hover:text-white transition-colors" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">Admin / Business Owner</h3>
              <p className="text-sm text-gray-500">Manage business data, transactions and reports.</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#6D54B5] transition-colors mt-2" />
          </Link>

          <Link 
            to="/login?workspace=accountant" 
            className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 hover:border-[#6D54B5]/30 hover:bg-purple-50/50 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 group-hover:bg-[#6D54B5] transition-colors">
              <Calculator className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">Accountant / Invoicing User</h3>
              <p className="text-sm text-gray-500">Record sales, purchases, invoices, payments and accounting data.</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#6D54B5] transition-colors mt-2" />
          </Link>

          <Link 
            to="/login?workspace=contact" 
            className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 hover:border-[#6D54B5]/30 hover:bg-purple-50/50 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0 group-hover:bg-[#6D54B5] transition-colors">
              <Users className="w-5 h-5 text-green-600 group-hover:text-white transition-colors" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">Contact</h3>
              <p className="text-sm text-gray-500">View your own invoices and bills and make payments.</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#6D54B5] transition-colors mt-2" />
          </Link>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <Link to="/" className="font-semibold text-gray-500 hover:text-gray-700 transition-colors">
            ← Back to website
          </Link>
        </div>
      </div>
    </AuthSplitLayout>
  );
}
