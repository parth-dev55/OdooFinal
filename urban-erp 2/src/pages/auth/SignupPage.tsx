import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import AuthSplitLayout from '../../components/auth/AuthSplitLayout';
import PasswordField from '../../components/auth/PasswordField';
import { ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [searchParams] = useSearchParams();
  const workspace = searchParams.get('workspace');
  
  const { profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already authenticated, redirect to their role-authorized dashboard
    if (!authLoading && profile && !success) {
      if (profile.role === 'CONTACT') {
        navigate('/contact/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [profile, authLoading, navigate, success]);

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await authService.signupUser(email, password, name);
      
      try {
        await authService.createProfile({ name, email });
      } catch (apiError) {
        console.warn('Failed to sync profile to backend immediately', apiError);
      }
      
      setSuccess(true);
      
      setTimeout(async () => {
        const profileInfo = await authService.getCurrentUserProfile();
        if (profileInfo?.role === 'CONTACT') {
          navigate('/contact/dashboard');
        } else {
          navigate('/dashboard');
        }
      }, 1500);
      
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address format.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak.');
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
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Create your account</h2>
          <p className="text-gray-500 text-sm">Get started with Urban Furniture Accounting ERP.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Account created successfully.
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D54B5] focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
              autoComplete="name"
            />
          </div>

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

          <PasswordField 
            label="Password" 
            id="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
          />

          <PasswordField 
            label="Confirm Password" 
            id="confirmPassword"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
          />
          
          {password.length > 0 && (
             <div className="flex gap-1 mt-2">
                <div className={`h-1 flex-1 rounded-full ${password.length > 0 ? 'bg-red-400' : 'bg-gray-200'}`}></div>
                <div className={`h-1 flex-1 rounded-full ${password.length >= 6 ? 'bg-yellow-400' : 'bg-gray-200'}`}></div>
                <div className={`h-1 flex-1 rounded-full ${password.length >= 8 && /[A-Z]/.test(password) ? 'bg-green-400' : 'bg-gray-200'}`}></div>
             </div>
          )}

          <button 
            type="submit" 
            disabled={loading || success}
            className="w-full bg-[#6D54B5] text-white py-3 rounded-xl font-semibold shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Account →'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to={`/login${workspace ? `?workspace=${workspace}` : ''}`} className="font-semibold text-[#6D54B5] hover:text-purple-700 transition-colors">
            Sign In
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
