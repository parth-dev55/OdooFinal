import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Bell, Search, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Topbar() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="h-full px-8 flex items-center justify-between">
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search anything..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#6D54B5]/20 focus:bg-white transition-all text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 pl-4">
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF8C61] rounded-full"></span>
          </button>
          
          <div className="w-px h-8 bg-gray-200 mx-2"></div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-gray-900 leading-none">{profile?.name || 'User'}</p>
              <p className="text-xs text-gray-500 mt-1">{profile?.role}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-purple-100 text-[#6D54B5] flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors ml-1"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
