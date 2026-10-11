import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export default function LandlordVerify() {
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const data = await api<{ data: { status: string } | null }>('/landlord/verification-status', { auth: true });
      setStatus(data.data?.status || null);
    } catch (err) {
      console.error('Failed to fetch status:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api('/landlord/verify-identity', {
        method: 'POST',
        auth: true,
        body: { nationalId, phone },
      });
      setStatus('PENDING');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const statusDisplay = () => {
    switch (status) {
      case 'PENDING':
        return <div className="p-3 bg-yellow-100 text-yellow-700 rounded-xl text-sm">⏳ Verification pending review</div>;
      case 'APPROVED':
        return <div className="p-3 bg-green-100 text-green-700 rounded-xl text-sm">✅ Identity verified</div>;
      case 'REJECTED':
        return <div className="p-3 bg-red-100 text-red-700 rounded-xl text-sm">❌ Verification rejected</div>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-accent">
      <div className="bg-white p-4 border-b border-border">
        <h1 className="text-text text-xl font-bold">Verify Identity</h1>
      </div>

      <div className="p-4 max-w-sm mx-auto">
        {statusDisplay()}

        {status !== 'PENDING' && status !== 'APPROVED' && (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <p className="text-muted text-sm">
              Submit your National ID and phone number for verification. This usually takes 1–2 business days.
            </p>

            <input
              type="text"
              placeholder="National ID number"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm"
            />

            <input
              type="tel"
              placeholder="Phone number (e.g., 0700123456)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm"
            />

            {error && <p className="text-danger text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white rounded-xl font-semibold disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit for Verification'}
            </button>
          </form>
        )}

        {status === 'APPROVED' && (
          <div className="mt-4 p-4 bg-white rounded-2xl border border-border">
            <p className="text-success font-semibold">✓ Your identity has been verified</p>
            <p className="text-muted text-sm mt-1">You can now create and manage listings.</p>
          </div>
        )}
      </div>
    </div>
  );
}
