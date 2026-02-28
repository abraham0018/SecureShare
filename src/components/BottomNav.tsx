import { Shield, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { icon: Shield, label: 'Vault', path: '/' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around py-3 px-6 safe-area-bottom">
      {tabs.map(tab => {
        const active = tab.path === '/' ? location.pathname === '/' : location.pathname.startsWith(tab.path);
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              active ? 'text-primary-foreground' : 'text-primary-foreground/50'
            }`}
          >
            <tab.icon size={22} />
            <span className="text-[11px] font-medium">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
