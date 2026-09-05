export default function ImpactSection() {
  return (
    <section className="py-24 px-6 lg:px-12 bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        
        {/* Left: Quote/Statement */}
        <div className="flex-1">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-8">
            "One transaction should not require multiple disconnected accounting entries."
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center border border-purple-200">
              <span className="font-bold text-[#6D54B5]">UF</span>
            </div>
            <div>
              <p className="font-bold text-gray-900">Urban Furniture Accounting</p>
              <p className="text-sm text-gray-500">Keeps operational transactions and accounting records connected throughout the workflow.</p>
            </div>
          </div>
        </div>

        {/* Right: Stat Cards */}
        <div className="flex-1 w-full max-w-md flex flex-col gap-4">
          <ImpactCard title="100% Connected Workflow" subtitle="No manual duplicate entries" />
          <ImpactCard title="Balanced Journal Entries" subtitle="Automated accounting logic" />
          <ImpactCard title="Real-Time Financial View" subtitle="Instant reporting updates" />
        </div>

      </div>
    </section>
  );
}

function ImpactCard({ title, subtitle }: { title: string, subtitle: string }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 flex flex-col justify-center shadow-sm">
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-500 font-medium">{subtitle}</p>
    </div>
  );
}
