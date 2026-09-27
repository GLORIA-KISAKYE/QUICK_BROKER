import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../utils/api';

export default function InspectionCode() {
  const { id } = useParams();
  const [code, setCode] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCode();
  }, [id]);

  const fetchCode = async () => {
    try {
      setLoading(true);
      const data = await api<{ expiresAt: string }>(`/inspections/${id}/code`, { auth: true });
      setExpiresAt(data.expiresAt);
      // In production, the code would be shown after verification
      setCode('483920');
    } catch (error) {
      console.error('Failed to fetch code:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-accent flex items-center justify-center text-muted">Loading...</div>;

  return (
    <div className="min-h-screen bg-accent flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <p className="text-muted text-sm mb-2">Show this code to the landlord</p>
        <div className="text-5xl font-bold tracking-[12px] text-primary my-6">{code}</div>
        <p className="text-muted text-sm">
          Expires: {expiresAt ? new Date(expiresAt).toLocaleString() : 'N/A'}
        </p>

        <div className="mt-8 space-y-3">
          <button className="w-full py-3 bg-primary text-white rounded-xl font-semibold">
            📞 Call Landlord
          </button>
          <button className="w-full py-3 bg-white border-2 border-primary text-primary rounded-xl font-semibold">
            💬 WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
