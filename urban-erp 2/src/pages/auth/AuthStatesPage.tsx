import { ReactNode } from 'react';
import AuthSplitLayout from '../../components/auth/AuthSplitLayout';
import PasswordField from '../../components/auth/PasswordField';
import { ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';

export default function AuthStatesPage() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-16">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Auth States Explorer</h1>
          <p className="text-gray-500">Previewing all required authentication UI states.</p>
        </div>

        {/* 1. Default Login */}
        <section>
          <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">1. Default Login</h2>
          <div className="border-4 border-purple-100 rounded-3xl overflow-hidden shadow-xl max-w-5xl">
            <AuthSplitLayout>
              <AuthCardWrapper>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Welcome back</h2>
                  <p className="text-gray-500 text-sm">Sign in to your Urban Furniture accounting workspace</p>
                </div>
                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Work Email</label>
                    <input type="email" placeholder="you@company.com" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl" readOnly />
                  </div>
                  <PasswordField label="Password" value="password123" onChange={() => {}} readOnly />
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded text-[#6D54B5] border-gray-300" readOnly />
                      <span className="text-sm text-gray-600">Remember me</span>
                    </label>
                    <span className="text-sm font-semibold text-[#6D54B5]">Forgot password?</span>
                  </div>
                  <button type="button" className="w-full bg-[#6D54B5] text-white py-3 rounded-xl font-semibold mt-2">Sign In to ERP →</button>
                </form>
              </AuthCardWrapper>
            </AuthSplitLayout>
          </div>
        </section>

        {/* 2. Loading */}
        <section>
          <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">2. Loading State</h2>
          <div className="border-4 border-purple-100 rounded-3xl overflow-hidden shadow-xl max-w-5xl">
            <AuthSplitLayout>
              <AuthCardWrapper>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Welcome back</h2>
                  <p className="text-gray-500 text-sm">Sign in to your Urban Furniture accounting workspace</p>
                </div>
                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Work Email</label>
                    <input type="email" value="alex@urbanfurniture.com" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-500" readOnly />
                  </div>
                  <PasswordField label="Password" value="password123" onChange={() => {}} readOnly />
                  <button type="button" disabled className="w-full bg-[#6D54B5] text-white py-3 rounded-xl font-semibold mt-2 opacity-70 cursor-not-allowed flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Signing In...
                  </button>
                </form>
              </AuthCardWrapper>
            </AuthSplitLayout>
          </div>
        </section>

        {/* 3. Invalid Email */}
        <section>
          <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">3. Invalid Email</h2>
          <div className="border-4 border-purple-100 rounded-3xl overflow-hidden shadow-xl max-w-5xl">
            <AuthSplitLayout>
              <AuthCardWrapper>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Welcome back</h2>
                  <p className="text-gray-500 text-sm">Sign in to your Urban Furniture accounting workspace</p>
                </div>
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                  Invalid email address format.
                </div>
                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Work Email</label>
                    <input type="text" value="alex@" className="w-full px-4 py-2.5 bg-white border border-red-300 rounded-xl text-gray-900 focus:ring-red-500" readOnly />
                  </div>
                  <PasswordField label="Password" value="password123" onChange={() => {}} readOnly />
                  <button type="button" className="w-full bg-[#6D54B5] text-white py-3 rounded-xl font-semibold mt-2">Sign In to ERP →</button>
                </form>
              </AuthCardWrapper>
            </AuthSplitLayout>
          </div>
        </section>

        {/* 4. Wrong Password */}
        <section>
          <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">4. Wrong Password / 5. Account Not Found</h2>
          <div className="border-4 border-purple-100 rounded-3xl overflow-hidden shadow-xl max-w-5xl">
            <AuthSplitLayout>
              <AuthCardWrapper>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Welcome back</h2>
                  <p className="text-gray-500 text-sm">Sign in to your Urban Furniture accounting workspace</p>
                </div>
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                  Invalid email or password.
                </div>
                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Work Email</label>
                    <input type="email" value="alex@urbanfurniture.com" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl" readOnly />
                  </div>
                  <PasswordField label="Password" value="wrongpass" onChange={() => {}} readOnly />
                  <button type="button" className="w-full bg-[#6D54B5] text-white py-3 rounded-xl font-semibold mt-2">Sign In to ERP →</button>
                </form>
              </AuthCardWrapper>
            </AuthSplitLayout>
          </div>
        </section>

        {/* 6. Network Error */}
        <section>
          <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">6. Network Error</h2>
          <div className="border-4 border-purple-100 rounded-3xl overflow-hidden shadow-xl max-w-5xl">
            <AuthSplitLayout>
              <AuthCardWrapper>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Welcome back</h2>
                  <p className="text-gray-500 text-sm">Sign in to your Urban Furniture accounting workspace</p>
                </div>
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                  Unable to connect to the server. Please try again.
                </div>
                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Work Email</label>
                    <input type="email" value="alex@urbanfurniture.com" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl" readOnly />
                  </div>
                  <PasswordField label="Password" value="password123" onChange={() => {}} readOnly />
                  <button type="button" className="w-full bg-[#6D54B5] text-white py-3 rounded-xl font-semibold mt-2">Sign In to ERP →</button>
                </form>
              </AuthCardWrapper>
            </AuthSplitLayout>
          </div>
        </section>

        {/* 7. Signup Success */}
        <section>
          <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">7. Signup Success</h2>
          <div className="border-4 border-purple-100 rounded-3xl overflow-hidden shadow-xl max-w-5xl">
            <AuthSplitLayout>
              <AuthCardWrapper>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Create your account</h2>
                  <p className="text-gray-500 text-sm">Get started with Urban Furniture Accounting ERP.</p>
                </div>
                <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Account created successfully. Redirecting...
                </div>
                <form className="space-y-4 opacity-50 pointer-events-none" onSubmit={(e) => e.preventDefault()}>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input type="text" value="Jane Doe" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl" readOnly />
                  </div>
                  <button type="button" disabled className="w-full bg-[#6D54B5] text-white py-3 rounded-xl font-semibold mt-4 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Redirecting...
                  </button>
                </form>
              </AuthCardWrapper>
            </AuthSplitLayout>
          </div>
        </section>

        {/* 8. Password Reset Sent */}
        <section>
          <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">8. Password Reset Sent</h2>
          <div className="border-4 border-purple-100 rounded-3xl overflow-hidden shadow-xl max-w-5xl">
            <AuthSplitLayout>
              <AuthCardWrapper>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Reset your password</h2>
                  <p className="text-gray-500 text-sm">Enter your email and we'll help you regain access to your account.</p>
                </div>
                <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm font-medium flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">Password reset email sent.</p>
                    <p className="text-green-600/80">Check your inbox for a link to reset your password. If it doesn't appear, check your spam folder.</p>
                  </div>
                </div>
              </AuthCardWrapper>
            </AuthSplitLayout>
          </div>
        </section>

      </div>
    </div>
  );
}

function AuthCardWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white rounded-3xl p-8 md:p-10 border border-gray-100 shadow-xl shadow-purple-900/5">
      {children}
      <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-400 font-medium uppercase tracking-wider">
        <ShieldCheck className="w-4 h-4" />
        Secure authentication
      </div>
    </div>
  );
}
