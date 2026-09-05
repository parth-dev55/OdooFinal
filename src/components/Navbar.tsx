import { Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-10 py-5 bg-white border-b border-gray-100">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-[#6D54B5] rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded-sm rotate-45"></div>
        </div>
        <div>
          <p className="font-bold text-gray-900 leading-tight">Urban Furniture</p>
          <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tighter">Accounting ERP</p>
        </div>
      </Link>

      {/* Desktop Links */}
      <div className="hidden lg:flex gap-8 text-[13px] font-medium text-gray-600">
        <a href="/#features" className="hover:text-[#6D54B5] transition-colors">Features</a>
        <a href="/#accounting" className="hover:text-[#6D54B5] transition-colors">Accounting</a>
        <a href="/#transactions" className="hover:text-[#6D54B5] transition-colors">Transactions</a>
        <a href="/#reports" className="hover:text-[#6D54B5] transition-colors">Reports</a>
        <a href="/#resources" className="hover:text-[#6D54B5] transition-colors">Resources</a>
      </div>

      {/* Actions */}
      <div className="hidden lg:flex items-center gap-4">
        <Link to="/login" className="text-[13px] font-semibold text-gray-700 hover:text-gray-900">
          Login
        </Link>
        <Link to="/signup" className="bg-[#6D54B5] text-white px-5 py-2 rounded-full text-[13px] font-semibold shadow-lg shadow-purple-200 hover:bg-purple-700 transition-colors">
          Get Started
        </Link>
      </div>

      {/* Mobile Menu Toggle */}
      <button className="lg:hidden p-2 text-gray-600">
        <Menu className="w-6 h-6" />
      </button>
    </nav>
  );
}
