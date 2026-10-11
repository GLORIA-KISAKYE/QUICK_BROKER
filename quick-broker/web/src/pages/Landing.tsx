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
  const [showRoleSelect, setShowRoleSelect] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Redirect landlords to their dashboard
    if (user?.role === 'LANDLORD') {
      navigate('/landlord');
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

  // Show role selection for unauthenticated users
  if (!user && showRoleSelect) {
    return (
      <div className="min-h-screen bg-accent flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🏠</div>
            <h1 className="text-2xl font-bold text-text">Join Quick-Broker</h1>
            <p className="text-muted text-sm mt-1">Choose how you want to use the app</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/auth/register?role=STUDENT')}
              className="w-full py-4 bg-primary text-white rounded-2xl font-semibold text-left px-5"
            >
              <div className="text-lg">🎓 I'm a Student</div>
              <div className="text-sm opacity-80 mt-1">Find housing near KIU</div>
            </button>

            <button
              onClick={() => navigate('/auth/register?role=LANDLORD')}
              className="w-full py-4 bg-white border-2 border-primary text-primary rounded-2xl font-semibold text-left px-5"
            >
              <div className="text-lg">🏠 I'm a Landlord</div>
              <div className="text-sm opacity-80 mt-1">List my properties</div>
            </button>

            <button
              onClick={() => setShowRoleSelect(false)}
              className="w-full py-2 text-muted text-sm"
            >
              ← Back to browsing
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent pb-20">
      {/* Header */}
      <div className="bg-white p-4 border-b border-border">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-text text-xl font-bold">Quick-Broker</h1>
            <p className="text-muted text-xs">Find student housing in Ishaka</p>
          </div>
          {!user && (
            <button
              onClick={() => setShowRoleSelect(true)}
              className="px-4 py-2 bg-primary text-white rounded-full text-sm font-semibold"
            >
              Sign Up
            </button>
          )}
        </div>
      </div>

      {/* Search */}
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

        {/* Filters */}
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

      {/* Listings */}
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
