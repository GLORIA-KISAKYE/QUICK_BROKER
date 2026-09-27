import { useState, useEffect } from 'react';
import { api } from '../utils/api';
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
  const [maxRent, setMaxRent] = useState('');

  useEffect(() => {
    fetchListings();
  }, [search, houseType, maxRent]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('area', search);
      if (houseType) params.set('houseType', houseType);
      if (maxRent) params.set('maxRent', maxRent);

      const data = await api<{ data: Listing[] }>(`/listings?${params}`);
      setListings(data.data);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-accent pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary p-4">
        <h1 className="text-white text-xl font-bold">Quick-Broker</h1>
        <p className="text-white/80 text-xs">Find student housing in Ishaka</p>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Search area..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-primary"
          />
          <button
            onClick={fetchListings}
            className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold"
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
              className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap border ${
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
