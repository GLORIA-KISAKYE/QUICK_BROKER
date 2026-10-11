import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

interface Stats {
  totalListings: number;
  totalInspections: number;
  pendingInspections: number;
}

export default function LandlordDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await api<Stats>('/landlord/stats', { auth: true });
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-accent flex items-center justify-center text-muted">Loading...</div>;

  return (
    <div className="min-h-screen bg-accent">
      <div className="bg-white p-4 border-b border-border">
        <h1 className="text-text text-xl font-bold">Landlord Dashboard</h1>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 border border-border">
            <p className="text-2xl font-bold text-primary">{stats?.totalListings || 0}</p>
            <p className="text-muted text-xs mt-1">Listings</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-border">
            <p className="text-2xl font-bold text-primary">{stats?.totalInspections || 0}</p>
            <p className="text-muted text-xs mt-1">Inspections</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-border">
            <p className="text-2xl font-bold text-warning">{stats?.pendingInspections || 0}</p>
            <p className="text-muted text-xs mt-1">Pending</p>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => navigate('/landlord/listings')}
            className="w-full py-3 bg-white border border-border rounded-xl text-left px-4 font-semibold text-sm"
          >
            📝 My Listings
          </button>
          <button
            onClick={() => navigate('/landlord/inspections')}
            className="w-full py-3 bg-white border border-border rounded-xl text-left px-4 font-semibold text-sm"
          >
            📋 Inspection Requests
          </button>
          <button
            onClick={() => navigate('/landlord/verify')}
            className="w-full py-3 bg-white border border-border rounded-xl text-left px-4 font-semibold text-sm"
          >
            ✅ Verify Identity
          </button>
        </div>
      </div>
    </div>
  );
}
