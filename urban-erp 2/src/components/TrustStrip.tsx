export default function TrustStrip() {
  return (
    <section className="py-12 border-b border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-sm font-medium text-gray-500 mb-8 uppercase tracking-widest">
          Everything connected in one accounting workflow.
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 md:gap-x-16">
          <TrustItem text="Master Data" />
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 hidden md:block"></div>
          <TrustItem text="Sales & Purchase" />
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 hidden md:block"></div>
          <TrustItem text="Accounting Automation" />
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 hidden md:block"></div>
          <TrustItem text="Financial Reporting" />
        </div>
      </div>
    </section>
  );
}

function TrustItem({ text }: { text: string }) {
  return (
    <div className="text-gray-800 font-semibold text-base md:text-lg tracking-tight">
      {text}
    </div>
  );
}
