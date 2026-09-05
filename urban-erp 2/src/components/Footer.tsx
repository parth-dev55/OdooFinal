export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-20 pb-10 px-6 lg:px-12 rounded-b-[2.5rem] md:rounded-b-[3rem]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
        
        {/* Brand Column */}
        <div className="lg:col-span-2 flex flex-col items-start">
          <div className="flex flex-col mb-6">
            <span className="text-2xl font-bold text-white leading-tight">Urban Furniture</span>
            <span className="text-sm font-semibold text-purple-400 uppercase tracking-wider">Accounting ERP</span>
          </div>
          <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
            Connected accounting for modern furniture businesses. Smart financial tools powered by connected workflows to help today's businesses plan, manage, and thrive with confidence.
          </p>
        </div>

        {/* Links Columns */}
        <div>
          <h4 className="text-white font-bold mb-6">Product</h4>
          <ul className="flex flex-col gap-4 text-sm text-gray-400">
            <li><a href="#" className="hover:text-white transition-colors">Dashboard</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Master Data</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Sales</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Purchases</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Accounting</h4>
          <ul className="flex flex-col gap-4 text-sm text-gray-400">
            <li><a href="#" className="hover:text-white transition-colors">Accounts</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Journals</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Payments</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Budget</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Reports</h4>
          <ul className="flex flex-col gap-4 text-sm text-gray-400">
            <li><a href="#" className="hover:text-white transition-colors">Balance Sheet</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Profit & Loss</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Budget Report</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-gray-500 text-xs text-center md:text-left">
          Copyright © 2026 Urban Furniture Accounting. All rights reserved.
        </p>
        <div className="flex items-center gap-6 text-gray-500 text-xs">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Cookie Settings</a>
        </div>
      </div>
    </footer>
  );
}
