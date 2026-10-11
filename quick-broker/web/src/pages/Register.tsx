import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'LANDLORD'>('STUDENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
          <div className="text-5xl mb-4">🏠</div>
          <h1 className="text-2xl font-bold text-text">Create Account</h1>
          <p className="text-muted text-sm mt-1">Choose your account type</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setRole('STUDENT')}
              className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold ${
                role === 'STUDENT' ? 'bg-primary text-white border-primary' : 'bg-white text-muted border-border'
              }`}
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => setRole('LANDLORD')}
              className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold ${
                role === 'LANDLORD' ? 'bg-primary text-white border-primary' : 'bg-white text-muted border-border'
              }`}
            >
              🏠 Landlord
            </button>
          </div>

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
