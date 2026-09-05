import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import AuthSplitLayout from '../../components/auth/AuthSplitLayout';
import PasswordField from '../../components/auth/PasswordField';
import { ShieldCheck, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const workspace = searchParams.get('workspace');
  const { refreshProfile, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const validateWorkspaceAndRedirect = (userRole: string) => {
    if (workspace === 'admin' && userRole !== 'ADMIN') {
      setError("You don't have access to the Admin workspace.");
      authService.logout();
      return;
    }
    if (workspace === 'accountant' && userRole !== 'ACCOUNTANT') {
      setError("You don't have access to the Accountant workspace.");
      authService.logout();
      return;
    }
    if (workspace === 'contact' && userRole !== 'CONTACT') {
      setError("You don't have access to the Contact workspace.");
      authService.logout();
      return;
    }

    if (userRole === 'CONTACT') {
      navigate('/contact/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  useEffect(() => {
    if (!authLoading && profile) {
      validateWorkspaceAndRedirect(profile.role);
    }
  }, [profile, authLoading, navigate, workspace]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await authService.loginUser(email, password);
      const profileInfo = await authService.getCurrentUserProfile();
      
      if (profileInfo) {
        validateWorkspaceAndRedirect(profileInfo.role);
      }
    } catch (err: any) {
      if (err.code === 'auth/invalid-email') {
        setError('Invalid email address format.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.message === 'Network Error') {
        setError('Unable to connect to the server. Please try again.');
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
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Welcome back</h2>
          <p className="text-gray-500 text-sm">Sign in to your Urban Furniture accounting workspace</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
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
            autoComplete="current-password"
          />

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded text-[#6D54B5] focus:ring-[#6D54B5] border-gray-300" />
              <span className="text-sm text-gray-600">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-sm font-semibold text-[#6D54B5] hover:text-purple-700 transition-colors">
              Forgot password?
            </Link>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#6D54B5] text-white py-3 rounded-xl font-semibold shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In to ERP →'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to={`/signup${workspace ? `?workspace=${workspace}` : ''}`} className="font-semibold text-[#6D54B5] hover:text-purple-700 transition-colors">
            Create Account
          </Link>
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-600">
          <Link to="/" className="font-semibold text-gray-500 hover:text-gray-700 transition-colors">
            ← Back to website
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
