import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import AuthSplitLayout from '../../components/auth/AuthSplitLayout';
import { ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address format.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplitLayout>
      <div className="bg-white rounded-3xl p-8 md:p-10 border border-gray-100 shadow-xl shadow-purple-900/5">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Reset your password</h2>
          <p className="text-gray-500 text-sm">Enter your email and we'll help you regain access to your account.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}
        
        {success ? (
          <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm font-medium flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">Password reset email sent.</p>
              <p className="text-green-600/80">Check your inbox for a link to reset your password. If it doesn't appear, check your spam folder.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Work Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D54B5] focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                autoComplete="email"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#6D54B5] text-white py-3 rounded-xl font-semibold shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-sm text-gray-600">
          <Link to="/login" className="font-semibold text-[#6D54B5] hover:text-purple-700 transition-colors">
            Back to Sign In
          </Link>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-400 font-medium uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          Secure authentication
        </div>
      </div>
    </AuthSplitLayout>
  );
}
