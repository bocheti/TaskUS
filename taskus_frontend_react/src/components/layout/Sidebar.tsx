import { Home, Users, Building2, User, X, Grid3x3 } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import BannerLogo from '@/assets/bannerLogo.svg';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const isActive = (path: string) => location.pathname === path;
  
  const handleLogout = () => {
    sessionStorage.setItem('isLoggingOut', 'true');
    logout();
    navigate('/login', { replace: true });
    toast.success('Logged out successfully');
  };
  
  const handleLinkClick = () => {
    onClose();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      <div className={`
        fixed
        top-0 left-0
        w-48 h-screen
        bg-muted
        flex flex-col justify-between px-4 py-8
        transition-transform duration-300 ease-in-out
        z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-foreground hover:text-primary md:hidden"
        >
          <X size={24} />
        </button>
        <div className="mb-6">
          <Link to="/about-us" onClick={handleLinkClick}>
            <img 
              src={BannerLogo} 
              alt="TaskUS Logo" 
              className="w-full cursor-pointer hover:opacity-90 transition-opacity" 
            />
          </Link>
        </div>
        <nav className="flex-1 flex flex-col justify-center space-y-3">
          <Link
            to="/dashboard"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
              isActive('/dashboard')
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-background'
            }`}
          >
            <Home size={22} />
            <span className="text-base font-medium">Dashboard</span>
          </Link>
          <Link
            to="/projects"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
              isActive('/projects')
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-background'
            }`}
          >
            <Grid3x3 size={22} />
            <span className="text-base font-medium">Projects</span>
          </Link>
          {user?.role === 'admin' && (
            <>
              <div className="pt-4 pb-2">
                <hr className="border-border" />
              </div>
              <Link
                to="/admin/users"
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                  isActive('/admin/users')
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-background'
                }`}
              >
                <Users size={22} />
                <span className="text-base font-medium">Users</span>
              </Link>
              <Link
                to="/admin/organisation"
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                  isActive('/admin/organisation')
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-background'
                }`}
              >
                <Building2 size={22} />
                <span className="text-base font-medium">Organisation</span>
              </Link>
            </>
          )}
        </nav>
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(prev => !prev)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
              isActive('/profile')
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-background'
            }`}
          >
            <User size={22} />
            <span className="text-base font-medium">Profile</span>
          </button>
          {isProfileOpen && (
            <div className="absolute bottom-14 left-0 w-40 bg-background border border-border rounded-lg shadow-lg z-50 animate-in fade-in zoom-in-95">
              <button
                onClick={() => {
                  navigate('/profile');
                  handleLinkClick();
                  setIsProfileOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 rounded-t-lg"
              >
                View Profile
              </button>

              <button
                onClick={() => {
                  handleLogout();
                  setIsProfileOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-slate-100 rounded-b-lg"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};