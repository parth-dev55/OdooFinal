import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PricingSection() {
  return (
    <section className="py-24 px-6 lg:px-12 bg-gray-50 rounded-[3rem] mx-4 my-12" id="pricing">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <div className="inline-flex items-center justify-center px-3 py-1 text-xs font-semibold text-gray-600 bg-gray-200 rounded-full mb-6 uppercase tracking-wider">
          Pricing Plan
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
          Built to Fit Your Business
        </h2>
        <p className="text-lg text-gray-500">
          Start with the core accounting workflow and expand as your business grows.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <PricingCard 
          tier="Starter"
          label="Prototype"
          description="Start free. Upgrade when you need advanced capabilities."
          features={[
            "Master Data",
            "Sales",
            "Purchases",
            "Basic Reports"
          ]}
        />
        
        <PricingCard 
          tier="Business"
          label="Business Ready"
          description="Recommended. Upgrade when you need connected accounting."
          isPopular
          features={[
            "Everything in Starter",
            "Payments",
            "Journal Entries",
            "Budget Management",
            "Financial Dashboard"
          ]}
        />

        <PricingCard 
          tier="Enterprise"
          label="Enterprise Ready"
          description="Scale freely. Custom deployment and granular controls."
          features={[
            "Everything in Business",
            "Advanced Reports",
            "Role-Based Access",
            "Audit Logs",
            "Scalable Architecture"
          ]}
        />
      </div>
    </section>
  );
}

function PricingCard({ 
  tier, 
  label, 
  description, 
  features, 
  isPopular = false 
}: { 
  tier: string, 
  label: string, 
  description: string, 
  features: string[], 
  isPopular?: boolean 
}) {
  return (
    <div className={`relative bg-white rounded-3xl p-8 flex flex-col h-full ${
      isPopular ? 'border-2 border-[#6D54B5] shadow-xl scale-105 z-10' : 'border border-gray-200 shadow-sm'
    }`}>
      {isPopular && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#6D54B5] text-white px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
          Recommended
        </div>
      )}
      
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          {tier} <span className="text-gray-400 font-normal text-sm">— {label}</span>
        </h3>
        <p className="text-sm text-gray-500 mt-2 h-10">{description}</p>
      </div>

      <div className="mb-8 border-t border-gray-100 pt-6">
        <p className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Includes:</p>
        <ul className="flex flex-col gap-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#6D54B5] shrink-0" />
              <span className="text-sm text-gray-600 font-medium">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link to="/workspace" className={`mt-auto w-full py-3 rounded-full font-semibold transition-colors text-center ${
        isPopular 
          ? 'bg-[#6D54B5] text-white hover:bg-purple-700 shadow-md shadow-purple-200' 
          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
      }`}>
        Get Started
      </Link>
    </div>
  );
}
