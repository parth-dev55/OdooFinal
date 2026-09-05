import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type PasswordFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export default function PasswordField({ label, ...props }: PasswordFieldProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <input
          {...props}
          type={show ? 'text' : 'password'}
          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D54B5] focus:border-transparent transition-all pr-10 text-gray-900 placeholder:text-gray-400"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
