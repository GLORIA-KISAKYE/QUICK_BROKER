import { useState, useEffect } from 'react';
import { api } from '../utils/api';

interface Report {
  id: string;
  listing_title: string;
  reporter_name: string;
  reason: string;
  details: string;
  status: string;
  created_at: string;
}

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await api<{ data: Report[] }>('/reports', { auth: true });
      setReports(data.data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: string, status: string) => {
    try {
      await api(`/reports/${id}`, { method: 'PATCH', auth: true, body: { status } });
      fetchReports();
    } catch (error) {
      console.error('Failed to resolve:', error);
    }
  };

  const statusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      REVIEWED: 'bg-blue-100 text-blue-700',
      RESOLVED: 'bg-green-100 text-green-700',
      DISMISSED: 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-accent">
      <div className="bg-white p-4 border-b border-border">
        <h1 className="text-text text-xl font-bold">Reports</h1>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="text-center py-8 text-muted">Loading...</div>
        ) : reports.length === 0 ? (
          <div className="text-center py-8 text-muted">No reports</div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="bg-white rounded-2xl p-4 border border-border">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-sm">{report.listing_title}</h3>
                    <p className="text-muted text-xs">By {report.reporter_name}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${statusColor(report.status)}`}>
                    {report.status}
                  </span>
                </div>
                <p className="text-muted text-xs mb-1">Reason: {report.reason}</p>
                {report.details && <p className="text-muted text-xs mb-2">{report.details}</p>}
                {report.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResolve(report.id, 'RESOLVED')}
                      className="flex-1 py-2 bg-green-500 text-white rounded-xl text-sm font-semibold"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => handleResolve(report.id, 'DISMISSED')}
                      className="flex-1 py-2 bg-gray-500 text-white rounded-xl text-sm font-semibold"
                    >
                      Dismiss
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
