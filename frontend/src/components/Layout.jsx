import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Briefcase, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Home,
  FileText,
  Heart,
  Target,
  PlusCircle,
  Users,
  LayoutDashboard
} from 'lucide-react';
import { useState } from 'react';

const Layout = () => {
  const { user, logout, isAuthenticated, isCandidate, isRecruiter } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const candidateLinks = [
    { path: '/candidate/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/jobs', icon: Briefcase, label: 'Browse Jobs' },
    { path: '/candidate/matched', icon: Target, label: 'Matched Jobs' },
    { path: '/candidate/applications', icon: FileText, label: 'Applications' },
    { path: '/candidate/saved', icon: Heart, label: 'Saved Jobs' },
    { path: '/candidate/profile', icon: User, label: 'Profile' },
  ];

  const recruiterLinks = [
    { path: '/recruiter/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/recruiter/post-job', icon: PlusCircle, label: 'Post Job' },
    { path: '/recruiter/jobs', icon: Briefcase, label: 'My Jobs' },
    { path: '/recruiter/applications', icon: Users, label: 'Applications' },
  ];

  const navLinks = isCandidate ? candidateLinks : isRecruiter ? recruiterLinks : [];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card border-t-0 border-x-0 rounded-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-400 flex items-center justify-center transform group-hover:scale-105 transition-transform">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-warm-100">JobMatch</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {isAuthenticated ? (
                <>
                  {navLinks.map(({ path, icon: Icon, label }) => (
                    <Link
                      key={path}
                      to={path}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                        isActive(path)
                          ? 'bg-primary-500/15 text-accent-300'
                          : 'text-warm-400 hover:text-warm-100 hover:bg-[#252528]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{label}</span>
                    </Link>
                  ))}
                </>
              ) : (
                <Link
                  to="/jobs"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive('/jobs')
                      ? 'bg-primary-500/15 text-accent-300'
                      : 'text-warm-400 hover:text-warm-100 hover:bg-[#252528]'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  <span className="text-sm font-medium">Jobs</span>
                </Link>
              )}
            </nav>

            {/* User Menu / Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-warm-200">{user.name}</p>
                    <p className="text-xs text-warm-400 capitalize">{user.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="btn-ghost flex items-center gap-2 text-warm-400 hover:text-rose-400"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Link to="/login" className="btn-ghost">Sign In</Link>
                  <Link to="/register" className="btn-primary text-sm">Get Started</Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-slate-400 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-700/50 animate-slide-down">
            <div className="px-4 py-4 space-y-2">
              {isAuthenticated ? (
                <>
                  {navLinks.map(({ path, icon: Icon, label }) => (
                    <Link
                      key={path}
                      to={path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive(path)
                          ? 'bg-primary-500/20 text-primary-300'
                          : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{label}</span>
                    </Link>
                  ))}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/jobs"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-700/50 hover:text-white"
                  >
                    <Briefcase className="w-5 h-5" />
                    <span className="font-medium">Browse Jobs</span>
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center btn-secondary"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center btn-primary"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="pt-20 pb-8 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2a2a2e] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-warm-400/60 text-sm">
          <p>&copy; 2024 JobMatch. Built with MERN Stack.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
