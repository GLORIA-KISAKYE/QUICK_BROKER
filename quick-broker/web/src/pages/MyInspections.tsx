import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

interface Inspection {
  id: string;
  listing_title: string;
  area: string;
  distance_from_kiu: number;
  status: string;
  preferred_time: string;
  created_at: string;
}

export default function MyInspections() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInspections();
  }, []);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      const data = await api<{ data: Inspection[] }>('/inspections/my', { auth: true });
      setInspections(data.data);
    } catch (error) {
      console.error('Failed to fetch inspections:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status: string) => {
    const colors: Record<string, string> = {
      REQUESTED: 'bg-yellow-100 text-yellow-700',
      ACCEPTED: 'bg-blue-100 text-blue-700',
      COMPLETED: 'bg-green-100 text-green-700',
      DECLINED: 'bg-red-100 text-red-700',
      INTERESTED: 'bg-green-100 text-green-700',
      NOT_INTERESTED: 'bg-red-100 text-red-700',
      RENTED: 'bg-purple-100 text-purple-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-accent pb-20">
      <div className="bg-gradient-to-r from-primary to-secondary p-4">
        <h1 className="text-white text-xl font-bold">My Inspections</h1>
      </div>

      <div className="p-3">
        {loading ? (
          <div className="text-center py-8 text-muted">Loading...</div>
        ) : inspections.length === 0 ? (
          <div className="text-center py-8 text-muted">No inspections yet</div>
        ) : (
          <div className="space-y-3">
            {inspections.map((inspection) => (
              <div
                key={inspection.id}
                onClick={() => navigate(`/inspections/${inspection.id}/code`)}
                className="bg-white rounded-2xl p-4 border border-border cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm">{inspection.listing_title}</h3>
                    <p className="text-muted text-xs mt-0.5">{inspection.area}</p>
                    <p className="text-muted text-xs">{inspection.distance_from_kiu} km from KIU</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${statusColor(inspection.status)}`}>
                    {inspection.status}
                  </span>
                </div>
                {inspection.preferred_time && (
                  <p className="text-muted text-xs mt-2">
                    📅 {new Date(inspection.preferred_time).toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
