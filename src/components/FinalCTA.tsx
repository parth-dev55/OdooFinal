export default function FinalCTA() {
  return (
    <section className="py-24 px-6 lg:px-12 bg-white pb-32">
      <div className="max-w-4xl mx-auto text-center rounded-[3rem] bg-[#6D54B5] text-white p-12 md:p-20 shadow-2xl relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-500 opacity-30 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Run Your Business With Clarity
          </h2>
          <p className="text-lg md:text-xl text-purple-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Connect business transactions, accounting records and financial reporting in one system.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-[#6D54B5] font-bold hover:bg-gray-50 transition-colors shadow-lg">
              Get Started
            </button>
            <button className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-purple-700 text-white font-medium border border-purple-500 hover:bg-purple-800 transition-colors">
              Explore Dashboard
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
