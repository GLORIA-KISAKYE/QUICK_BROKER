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

export default function Saved() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSaved();
  }, []);

  const fetchSaved = async () => {
    try {
      setLoading(true);
      const data = await api<{ data: Listing[] }>('/saved', { auth: true });
      setListings(data.data);
    } catch (error) {
      console.error('Failed to fetch saved:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-accent pb-20">
      <div className="bg-gradient-to-r from-primary to-secondary p-4">
        <h1 className="text-white text-xl font-bold">My Saved Houses</h1>
      </div>

      <div className="p-3">
        {loading ? (
          <div className="text-center py-8 text-muted">Loading...</div>
        ) : listings.length === 0 ? (
          <div className="text-center py-8 text-muted">No saved houses yet</div>
        ) : (
          listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)
        )}
      </div>
    </div>
  );
}
