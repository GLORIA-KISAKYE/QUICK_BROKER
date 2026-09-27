import { useState, useEffect } from 'react';
import { api } from '../utils/api';

interface Inspection {
  id: string;
  listing_title: string;
  student_name: string;
  student_email: string;
  status: string;
  preferred_time: string;
  created_at: string;
}

export default function AdminInspections() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInspections();
  }, []);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      const data = await api<{ data: Inspection[] }>('/inspections', { auth: true });
      setInspections(data.data);
    } catch (error) {
      console.error('Failed to fetch inspections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await api(`/inspections/${id}/accept`, { method: 'PATCH', auth: true });
      fetchInspections();
    } catch (error) {
      console.error('Failed to accept:', error);
    }
  };

  const handleDecline = async (id: string) => {
    try {
      await api(`/inspections/${id}/decline`, { method: 'PATCH', auth: true });
      fetchInspections();
    } catch (error) {
      console.error('Failed to decline:', error);
    }
  };

  const statusColor = (status: string) => {
    const colors: Record<string, string> = {
      REQUESTED: 'bg-yellow-100 text-yellow-700',
      ACCEPTED: 'bg-blue-100 text-blue-700',
      COMPLETED: 'bg-green-100 text-green-700',
      DECLINED: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-accent">
      <div className="bg-gradient-to-r from-primary to-secondary p-4">
        <h1 className="text-white text-xl font-bold">Manage Inspections</h1>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="text-center py-8 text-muted">Loading...</div>
        ) : inspections.length === 0 ? (
          <div className="text-center py-8 text-muted">No inspections</div>
        ) : (
          <div className="space-y-3">
            {inspections.map((inspection) => (
              <div key={inspection.id} className="bg-white rounded-2xl p-4 border border-border">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-sm">{inspection.listing_title}</h3>
                    <p className="text-muted text-xs">{inspection.student_name} · {inspection.student_email}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${statusColor(inspection.status)}`}>
                    {inspection.status}
                  </span>
                </div>
                {inspection.preferred_time && (
                  <p className="text-muted text-xs mb-2">
                    📅 {new Date(inspection.preferred_time).toLocaleString()}
                  </p>
                )}
                {inspection.status === 'REQUESTED' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(inspection.id)}
                      className="flex-1 py-2 bg-green-500 text-white rounded-xl text-sm font-semibold"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDecline(inspection.id)}
                      className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
