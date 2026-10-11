import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'LANDLORD'>('STUDENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'LANDLORD' || roleParam === 'STUDENT') {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api('/auth/register', { method: 'POST', body: { name, email, role } });
      navigate('/auth/verify', { state: { email } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-accent flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">{role === 'LANDLORD' ? '🏠' : '🎓'}</div>
          <h1 className="text-2xl font-bold text-text">
            {role === 'LANDLORD' ? 'Landlord Registration' : 'Student Registration'}
          </h1>
          <p className="text-muted text-sm mt-1">
            {role === 'LANDLORD' ? 'List your properties on Quick-Broker' : 'Find housing near KIU'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-primary"
          />

          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-primary"
          />

          {error && <p className="text-danger text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white rounded-xl font-semibold disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-muted text-sm mt-4">
          Already have an account?{' '}
          <button onClick={() => navigate('/auth/login')} className="text-primary font-semibold">
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
