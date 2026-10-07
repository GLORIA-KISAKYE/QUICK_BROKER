import { useLocation, useNavigate } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const items = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/saved', icon: '🔍', label: 'Search' },
    { path: '/inspections', icon: '🔔', label: 'Alerts' },
    { path: '/saved', icon: '👤', label: 'Profile' },
  ];

  if (location.pathname.startsWith('/auth') || location.pathname.startsWith('/admin')) {
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
          <span className="text-xl">{item.icon}</span>
          <span className="text-xs">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
