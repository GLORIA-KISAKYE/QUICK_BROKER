import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function MagicLinkSent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const email = (location.state as { email?: string })?.email || '';
  const magicLink = (location.state as { magicLink?: string })?.magicLink || '';

  const handleResend = async () => {
    setLoading(true);
    setError('');
    try {
      const { api } = await import('../utils/api');
      await api('/auth/magic', { method: 'POST', body: { email } });
      setError('New link generated! Check below.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend link');
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

        {magicLink && (
          <div className="mt-6 p-4 bg-white rounded-2xl border border-border">
            <p className="text-muted text-xs mb-2">Dev mode — click your login link:</p>
            <a
              href={magicLink}
              className="text-primary font-semibold text-sm underline break-all"
            >
              Click here to log in →
            </a>
          </div>
        )}

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
