import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function MagicLinkVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'LANDLORD' | 'ADMIN'>('STUDENT');

  useEffect(() => {
    verifyToken();
  }, []);

  const verifyToken = async () => {
    try {
      setLoading(true);
      const token = searchParams.get('token');
      if (!token) throw new Error('No token provided');

      const data = await api<{ email: string; isNewUser: boolean }>(`/auth/magic/verify?token=${token}`);
      setEmail(data.email);
      setIsNewUser(data.isNewUser);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid or expired link');
      setLoading(false);
    }
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await api<{
        accessToken: string;
        refreshToken: string;
        user: { id: string; email: string; name: string; role: string };
      }>('/auth/magic/complete', {
        method: 'POST',
        body: { email, name, role },
      });

      login(data.accessToken, data.user as { id: string; email: string; name: string; role: 'STUDENT' | 'LANDLORD' | 'ADMIN' });
      if (data.user.role === 'LANDLORD') {
        navigate('/landlord');
      } else if (data.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-accent flex items-center justify-center text-muted">
        Verifying...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-accent flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-xl font-bold text-text">Link Expired</h1>
          <p className="text-danger text-sm mt-2">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-full font-semibold"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">✨</div>
          <h1 className="text-xl font-bold text-text">Welcome!</h1>
          <p className="text-muted text-sm mt-1">{email}</p>
        </div>

        {isNewUser && (
          <form onSubmit={handleComplete} className="space-y-4">
            <p className="text-muted text-sm">Tell us a bit about yourself:</p>
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm"
            />
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`w-full py-3 rounded-xl border-2 text-sm font-semibold ${
                  role === 'STUDENT' ? 'bg-primary text-white border-primary' : 'bg-white text-muted border-border'
                }`}
              >
                🎓 Student
              </button>
              <button
                type="button"
                onClick={() => setRole('LANDLORD')}
                className={`w-full py-3 rounded-xl border-2 text-sm font-semibold ${
                  role === 'LANDLORD' ? 'bg-primary text-white border-primary' : 'bg-white text-muted border-border'
                }`}
              >
                🏠 Landlord
              </button>
              <button
                type="button"
                onClick={() => setRole('ADMIN')}
                className={`w-full py-3 rounded-xl border-2 text-sm font-semibold ${
                  role === 'ADMIN' ? 'bg-primary text-white border-primary' : 'bg-white text-muted border-border'
                }`}
              >
                ⚙️ Admin
              </button>
            </div>
            {error && <p className="text-danger text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white rounded-full font-semibold disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Complete Setup'}
            </button>
          </form>
        )}

        {!isNewUser && (
          <div className="space-y-4">
            <p className="text-muted text-sm">Complete your login:</p>
            {error && <p className="text-danger text-sm">{error}</p>}
            <button
              onClick={handleComplete}
              disabled={loading}
              className="w-full py-3 bg-primary text-white rounded-full font-semibold disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
