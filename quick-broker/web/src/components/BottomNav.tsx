import { useLocation, useNavigate } from 'react-router-dom';
import HouseIcon from './HouseIcon';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const items = [
    { path: '/', icon: <HouseIcon size={20} />, label: 'Home' },
    { path: '/saved', icon: <span className="text-xl">🔍</span>, label: 'Search' },
    { path: '/inspections', icon: <span className="text-xl">🔔</span>, label: 'Alerts' },
    { path: '/saved', icon: <span className="text-xl">👤</span>, label: 'Profile' },
  ];

  if (location.pathname.startsWith('/auth') || location.pathname.startsWith('/admin') || location.pathname.startsWith('/landlord')) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border flex justify-around py-2 z-50">
      {items.map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
            location.pathname === item.path ? 'text-primary' : 'text-muted'
          }`}
        >
          {item.icon}
          <span className="text-xs">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
