import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';


export default function MagicLinkSent() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleResend = async () => {
    setLoading(true);
    setError('');
    try {
      await api('/auth/magic', { method: 'POST', body: { email } });
      setError('Link sent! Check your email.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-accent flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <div className="text-5xl mb-4">📧</div>
        <h1 className="text-2xl font-bold text-text">Check Your Email</h1>
        <p className="text-muted text-sm mt-2">
          We sent a login link to <strong>{email}</strong>
        </p>
        <p className="text-muted text-xs mt-4">
          Click the link in your email to log in. The link expires in 10 minutes.
        </p>

        {error && <p className="text-primary text-sm mt-4">{error}</p>}

        <button
          onClick={handleResend}
          disabled={loading}
          className="mt-6 w-full py-3 bg-primary text-white rounded-full font-semibold disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Resend Link'}
        </button>

        <button
          onClick={() => navigate('/')}
          className="mt-4 text-muted text-sm underline"
        >
          ← Back to home
        </button>
      </div>
    </div>
  );
}
