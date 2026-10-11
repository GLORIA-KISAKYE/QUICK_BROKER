import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await api<{
        accessToken?: string;
        refreshToken?: string;
        user?: { id: string; email: string; name: string; role: string };
        isNewUser: boolean;
      }>('/auth/send-otp', { method: 'POST', body: { email } });

      if (data.isNewUser) {
        // New user — go to registration then OTP
        navigate('/auth/register', { state: { email } });
      } else if (data.accessToken && data.user) {
        // Existing user — direct login
        login(data.accessToken, data.user);
        if (data.user.role === 'LANDLORD') {
          navigate('/landlord');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-accent flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🏠</div>
          <h1 className="text-2xl font-bold text-text">Welcome Back</h1>
          <p className="text-muted text-sm mt-1">Enter your email to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-full border border-border bg-white text-sm focus:outline-none focus:border-primary"
          />

          {error && <p className="text-danger text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white rounded-full font-semibold disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Continue'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-muted text-xs">
            New users will be asked to verify with a one-time code.
            <br />
            Existing users get instant access.
          </p>
        </div>

        <p className="text-center text-muted text-sm mt-4">
          Don't have an account?{' '}
          <button onClick={() => navigate('/')} className="text-primary font-semibold">
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
