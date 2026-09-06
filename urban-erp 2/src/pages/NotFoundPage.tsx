import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, LayoutDashboard, ArrowLeft, Search } from 'lucide-react';

export default function NotFoundPage() {
  const { profile } = useAuth();
  const isAuthenticated = !!profile;
  const isContact = profile?.role === 'CONTACT';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-purple-50 text-[#6D54B5] flex items-center justify-center mb-6 shadow-sm border border-purple-100">
          <Search className="w-10 h-10" />
        </div>

        <span className="text-sm font-bold tracking-widest text-[#6D54B5] uppercase">
          Error 404
        </span>
        <h1 className="text-3xl font-extrabold text-gray-900 mt-2 mb-3 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          The page you are looking for does not exist, has been moved, or the URL might be incorrect.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {isAuthenticated ? (
            <Link
              to={isContact ? '/contact/dashboard' : '/dashboard'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#6D54B5] text-white text-sm font-semibold hover:bg-purple-700 transition-colors shadow-md shadow-purple-200"
            >
              <LayoutDashboard className="w-4 h-4" />
              Go to Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#6D54B5] text-white text-sm font-semibold hover:bg-purple-700 transition-colors shadow-md shadow-purple-200"
            >
              Sign In
            </Link>
          )}

          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
          >
            <Home className="w-4 h-4" />
            Back to Website
          </Link>
        </div>
      </div>
    </div>
  );
}
