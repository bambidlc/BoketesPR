import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Map, List, User, Plus, Trophy } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks';
import { useStore } from '../../store/useStore';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { openSignInPrompt } = useStore();

  const navItems = [
    { to: '/', icon: Map, label: 'Mapa' },
    { to: '/list', icon: List, label: 'Lista' },
    { to: '/leaderboard', icon: Trophy, label: 'Líderes' },
    { to: '/profile', icon: User, label: 'Perfil' },
  ];

  // Don't show on report page
  if (location.pathname === '/report') {
    return null;
  }

  // Handle FAB click
  const handleReportClick = () => {
    if (isAuthenticated) {
      navigate('/report');
    } else {
      openSignInPrompt('Inicia sesión para reportar boketes y ayudar a tu comunidad.');
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-dark-950/95 backdrop-blur-lg border-t border-dark-800">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 p-2 rounded-xl transition-colors min-w-[56px]',
                isActive
                  ? 'text-primary-500'
                  : 'text-dark-400 hover:text-dark-200'
              )
            }
          >
            <item.icon size={20} strokeWidth={1.5} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}

        {/* FAB for report - always visible */}
        <button
          onClick={handleReportClick}
          className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-105 active:scale-95 transition-all animate-pulse-glow"
        >
          <Plus size={28} strokeWidth={2.5} className="text-white" />
        </button>
      </div>
    </nav>
  );
}

