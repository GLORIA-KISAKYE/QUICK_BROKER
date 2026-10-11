import { useState, useEffect } from 'react';
import { api } from '../utils/api';

interface Verification {
  id: string;
  landlord_name: string;
  landlord_email: string;
  national_id_number: string;
  phone: string;
  status: string;
  created_at: string;
}

export default function AdminVerifications() {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const data = await api<{ data: Verification[] }>('/admin/verifications', { auth: true });
      setVerifications(data.data);
    } catch (error) {
      console.error('Failed to fetch verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api(`/admin/verifications/${id}/approve`, { method: 'PATCH', auth: true });
      fetchVerifications();
    } catch (error) {
      console.error('Failed to approve:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api(`/admin/verifications/${id}/reject`, {
        method: 'PATCH',
        auth: true,
        body: { reason: rejectReason }
      });
      setRejectReason('');
      fetchVerifications();
    } catch (error) {
      console.error('Failed to reject:', error);
    }
  };

  const statusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      APPROVED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-accent">
      <div className="bg-white p-4 border-b border-border">
        <h1 className="text-text text-xl font-bold">Landlord Verifications</h1>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="text-center py-8 text-muted">Loading...</div>
        ) : verifications.length === 0 ? (
          <div className="text-center py-8 text-muted">No verification requests</div>
        ) : (
          <div className="space-y-3">
            {verifications.map((v) => (
              <div key={v.id} className="bg-white rounded-2xl p-4 border border-border">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-sm">{v.landlord_name}</h3>
                    <p className="text-muted text-xs">{v.landlord_email}</p>
                    <p className="text-muted text-xs">ID: {v.national_id_number}</p>
                    <p className="text-muted text-xs">Phone: {v.phone}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${statusColor(v.status)}`}>
                    {v.status}
                  </span>
                </div>
                {v.status === 'PENDING' && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Rejection reason (optional)"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(v.id)}
                        className="flex-1 py-2 bg-green-500 text-white rounded-xl text-sm font-semibold"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(v.id)}
                        className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold"
                      >
                        Reject
                      </button>
                    </div>
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
