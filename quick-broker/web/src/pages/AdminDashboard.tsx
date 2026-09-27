import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalListings: 0,
    totalStudents: 0,
    totalInspections: 0,
    totalReviews: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await api<typeof stats>('/admin/stats', { auth: true });
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const cards = [
    { label: 'Total Listings', value: stats.totalListings, path: '/admin/listings' },
    { label: 'Students', value: stats.totalStudents, path: '/admin' },
    { label: 'Inspections', value: stats.totalInspections, path: '/admin/inspections' },
    { label: 'Reviews', value: stats.totalReviews, path: '/admin' },
  ];

  return (
    <div className="min-h-screen bg-accent">
      <div className="bg-gradient-to-r from-primary to-secondary p-4">
        <h1 className="text-white text-xl font-bold">Admin Dashboard</h1>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-6">
          {cards.map((card) => (
            <div
              key={card.label}
              onClick={() => navigate(card.path)}
              className="bg-white rounded-2xl p-4 border border-border cursor-pointer hover:shadow-md transition-shadow"
            >
              <p className="text-2xl font-bold text-primary">{card.value}</p>
              <p className="text-muted text-xs mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <button
            onClick={() => navigate('/admin/listings')}
            className="w-full py-3 bg-white border border-border rounded-xl text-left px-4 font-semibold text-sm"
          >
            📝 Manage Listings
          </button>
          <button
            onClick={() => navigate('/admin/inspections')}
            className="w-full py-3 bg-white border border-border rounded-xl text-left px-4 font-semibold text-sm"
          >
            📋 Manage Inspections
          </button>
          <button
            onClick={() => navigate('/admin/reports')}
            className="w-full py-3 bg-white border border-border rounded-xl text-left px-4 font-semibold text-sm"
          >
            ⚠️ View Reports
          </button>
        </div>
      </div>
    </div>
  );
}
