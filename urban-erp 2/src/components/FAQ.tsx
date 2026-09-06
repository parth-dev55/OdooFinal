import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    question: "What is Urban Furniture Accounting ERP?",
    answer: "It is a centralized accounting system designed specifically for modern furniture businesses. It connects master data, sales, purchases, invoices, payments, journal entries, and ledgers into one seamless workflow."
  },
  {
    question: "How does the sales workflow work?",
    answer: "When a sales order is created, you can instantly generate a customer invoice. Once the payment is recorded against that invoice, the system automatically creates the appropriate journal entries and updates the ledger."
  },
  {
    question: "How does the purchase workflow work?",
    answer: "Purchase orders convert to vendor bills without duplicate data entry. When you register a payment for a vendor bill, the system automatically posts the corresponding balanced journal entries."
  },
  {
    question: "How are journal entries generated?",
    answer: "Journal entries are generated automatically based on underlying operational transactions (like validating an invoice or registering a payment). Manual journal entries can also be created for specific accounting adjustments."
  },
  {
    question: "How does the system calculate taxes?",
    answer: "Taxes are calculated based on pre-defined tax rules applied to products and contacts (master data). The calculated tax amounts are automatically separated into the correct tax accounts in the generated journal entries."
  },
  {
    question: "How are financial reports generated?",
    answer: "Financial reports like the Balance Sheet, Profit & Loss, and Budget vs. Actual are generated in real-time by aggregating the balanced journal entries posted to the general ledger."
  },
  {
    question: "Can different users have different permissions?",
    answer: "Yes, the system supports role-based access control. You can restrict users to specific modules, such as allowing sales reps to see only sales orders, while restricting accounting access to the finance team."
  },
  {
    question: "Can the system scale for larger businesses?",
    answer: "Absolutely. The architecture is designed to handle high transaction volumes, complex chart of accounts, multiple analytical dimensions, and large product catalogs as your business grows."
  }
];

export default function FAQ() {
  return (
    <section className="py-24 px-6 lg:px-12 bg-gray-50 my-12 mx-4 rounded-[3rem]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">Frequently Asked Questions</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Got Questions? We've Got Answers
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} defaultOpen={index === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ question, answer, defaultOpen = false }: { key?: any, question: string, answer: string, defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all duration-200">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
      >
        <span className="font-semibold text-lg text-gray-900">{question}</span>
        <span className="text-gray-400 shrink-0 ml-4">
          {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </span>
      </button>
      <div 
        className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <p className="text-gray-600 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}
