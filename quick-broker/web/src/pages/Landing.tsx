import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ListingCard from '../components/ListingCard';
import HouseIcon from '../components/HouseIcon';

interface Listing {
  id: string;
  title: string;
  house_type: string;
  rent_amount: number;
  area: string;
  distance_from_kiu: number;
  osrm_distance_km: number;
  transport_info: string;
  photos: string[];
  status: string;
}

export default function Landing() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [houseType, setHouseType] = useState('');
  const [view, setView] = useState<'welcome' | 'browse'>('welcome');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (view === 'browse') {
      fetchListings();
    }
  }, [search, houseType, view]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('area', search);
      if (houseType) params.set('houseType', houseType);

      const data = await api<{ data: Listing[] }>(`/listings?${params}`);
      setListings(data.data);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Welcome screen — ALWAYS the first thing users see
  if (view === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="mb-4 flex justify-center">
            <HouseIcon size={64} color="#fff" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Quick-Broker</h1>
          <p className="text-white/80 text-sm mb-8">Find the right student house without walking around Ishaka</p>

          {user && (
            <div className="mb-4 p-3 bg-white/20 rounded-xl">
              <p className="text-white text-sm">Welcome back, <strong>{user.name}</strong></p>
              <p className="text-white/70 text-xs capitalize">{user.role}</p>
            </div>
          )}

          <div className="space-y-3">
            {user ? (
              <>
                <button
                  onClick={() => navigate(user.role === 'LANDLORD' ? '/landlord' : user.role === 'ADMIN' ? '/admin' : '/')}
                  className="w-full py-4 bg-white text-primary rounded-2xl font-semibold text-left px-5 shadow-lg"
                >
                  <div className="text-lg">
                    {(user.role as string) === 'LANDLORD' ? '🏠 Go to Landlord Dashboard' : (user.role as string) === 'ADMIN' ? '⚙️ Go to Admin Dashboard' : '🎓 Browse Listings'}
                  </div>
                  <div className="text-sm opacity-70 mt-1">Continue as {user.name}</div>
                </button>

                <button
                  onClick={() => setView('browse')}
                  className="w-full py-3 bg-white/20 text-white border-2 border-white rounded-2xl font-semibold text-sm"
                >
                  Browse as guest →
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/auth/login')}
                  className="w-full py-4 bg-white text-primary rounded-2xl font-semibold text-left px-5 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="text-lg">✨ Log In / Sign Up</div>
                  <div className="text-sm opacity-70 mt-1">Magic link sent to your email</div>
                </button>

                <button
                  onClick={() => setView('browse')}
                  className="mt-4 text-white/80 text-sm underline"
                >
                  Browse listings without an account →
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Student browse view
  return (
    <div className="min-h-screen bg-accent pb-20">
      <div className="bg-white p-4 border-b border-border">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-text text-xl font-bold">Quick-Broker</h1>
            <p className="text-muted text-xs">Find student housing in Ishaka</p>
          </div>
          <button
            onClick={() => setView('welcome')}
            className="px-4 py-2 bg-primary text-white rounded-full text-sm font-semibold"
          >
            Home
          </button>
        </div>
      </div>

      <div className="p-3">
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Search area, house type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 rounded-full border border-border bg-white text-sm focus:outline-none focus:border-primary"
          />
          <button
            onClick={fetchListings}
            className="px-5 py-2 bg-primary text-white rounded-full text-sm font-semibold"
          >
            Search
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {['', 'SINGLE_ROOM', 'DOUBLE_ROOM', 'SELF_CONTAINED_SINGLE'].map((type) => (
            <button
              key={type}
              onClick={() => setHouseType(type)}
              className={`px-4 py-1.5 rounded-full text-xs whitespace-nowrap border ${
                houseType === type
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-muted border-border'
              }`}
            >
              {type === '' ? 'All' : type.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="px-3">
        {loading ? (
          <div className="text-center py-8 text-muted">Loading...</div>
        ) : listings.length === 0 ? (
          <div className="text-center py-8 text-muted">No listings found</div>
        ) : (
          listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)
        )}
      </div>
    </div>
  );
}
