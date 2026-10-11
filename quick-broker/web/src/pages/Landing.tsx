import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ListingCard from '../components/ListingCard';

interface Listing {
  id: string;
  title: string;
  house_type: string;
  rent_amount: number;
  area: string;
  distance_from_kiu: number;
  transport_time_boda: number;
  photos: string[];
  status: string;
}

export default function Landing() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [houseType, setHouseType] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'LANDLORD') {
      navigate('/landlord');
      return;
    }
    fetchListings();
  }, [search, houseType, user, navigate]);

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

  // Role selection screen (shown by default when not logged in)
  if (!user) {
    return (
      <div className="min-h-screen bg-accent flex flex-col">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary to-secondary p-8 text-center">
          <div className="text-6xl mb-4">🏠</div>
          <h1 className="text-3xl font-bold text-white">Quick-Broker</h1>
          <p className="text-white/80 mt-2">Find the right student house without walking around Ishaka</p>
        </div>

        {/* Role Selection */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
            <h2 className="text-xl font-bold text-text text-center mb-6">How do you want to use Quick-Broker?</h2>

            <div className="space-y-4">
              <button
                onClick={() => navigate('/auth/register?role=STUDENT')}
                className="w-full py-5 bg-primary text-white rounded-2xl font-semibold text-left px-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-xl">🎓 I'm a Student</div>
                <div className="text-sm opacity-80 mt-1">Find housing near KIU</div>
              </button>

              <button
                onClick={() => navigate('/auth/register?role=LANDLORD')}
                className="w-full py-5 bg-white border-2 border-primary text-primary rounded-2xl font-semibold text-left px-6 hover:bg-accent transition-colors"
              >
                <div className="text-xl">🏠 I'm a Landlord</div>
                <div className="text-sm opacity-80 mt-1">List my properties</div>
              </button>
            </div>

            <p className="text-center text-muted text-sm mt-6">
              Already have an account?{' '}
              <button onClick={() => navigate('/auth/login')} className="text-primary font-semibold">
                Login
              </button>
            </p>
          </div>
        </div>

        {/* Preview Section */}
        <div className="p-4 border-t border-border bg-white">
          <p className="text-muted text-xs text-center mb-3">Available listings</p>
          <div className="space-y-2">
            {loading ? (
              <div className="skeleton h-20 rounded-xl"></div>
            ) : (
              listings.slice(0, 2).map((listing) => (
                <div key={listing.id} className="bg-accent rounded-xl p-3 flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-xl">🏠</div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-text">{listing.house_type.replace(/_/g, ' ')}</p>
                    <p className="text-muted text-xs">{listing.area}</p>
                  </div>
                  <p className="text-primary font-bold text-sm">UGX {listing.rent_amount.toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // Student view (logged in)
  return (
    <div className="min-h-screen bg-accent pb-20">
      <div className="bg-white p-4 border-b border-border">
        <h1 className="text-text text-xl font-bold">Quick-Broker</h1>
        <p className="text-muted text-xs">Find student housing in Ishaka</p>
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
