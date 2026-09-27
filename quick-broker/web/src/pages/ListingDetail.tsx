import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

interface Listing {
  id: string;
  title: string;
  house_type: string;
  rent_amount: number;
  area: string;
  distance_from_kiu: number;
  transport_time_boda: number;
  transport_time_walk: number;
  electricity: string;
  water: string;
  kitchen: string;
  bathroom: string;
  toilet: string;
  flooring: string;
  other_charges: string;
  photos: string[];
  status: string;
}

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      const data = await api<{ data: Listing }>(`/listings/${id}`);
      setListing(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load listing');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (listing) {
      window.location.href = `tel:${listing.other_charges}`;
    }
  };

  const handleWhatsApp = () => {
    if (listing) {
      const text = encodeURIComponent(`Hi, I'm interested in the ${listing.house_type} in ${listing.area}`);
      window.open(`https://wa.me/256700000000?text=${text}`, '_blank');
    }
  };

  if (loading) return <div className="min-h-screen bg-accent flex items-center justify-center text-muted">Loading...</div>;
  if (error) return <div className="min-h-screen bg-accent flex items-center justify-center text-danger">{error}</div>;
  if (!listing) return null;

  return (
    <div className="min-h-screen bg-accent pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary p-4">
        <h1 className="text-white text-lg font-bold">{listing.title}</h1>
        <p className="text-white/80 text-xs">{listing.area}</p>
      </div>

      {/* Image */}
      <div className="h-48 bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-6xl">
        🏠
      </div>

      <div className="p-4 space-y-4">
        {/* Rent */}
        <div className="bg-white rounded-2xl p-4 border border-border">
          <p className="text-primary text-2xl font-bold">UGX {listing.rent_amount.toLocaleString()}/month</p>
          <p className="text-muted text-sm mt-1">{listing.distance_from_kiu} km from KIU · ~{listing.transport_time_boda} min boda</p>
        </div>

        {/* Details */}
        <div className="bg-white rounded-2xl p-4 border border-border">
          <h2 className="font-bold text-sm text-muted uppercase mb-3">Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted">Type</span><span>{listing.house_type.replace(/_/g, ' ')}</span></div>
            <div className="flex justify-between"><span className="text-muted">Kitchen</span><span>{listing.kitchen || 'N/A'}</span></div>
            <div className="flex justify-between"><span className="text-muted">Bathroom</span><span>{listing.bathroom || 'N/A'}</span></div>
            <div className="flex justify-between"><span className="text-muted">Toilet</span><span>{listing.toilet || 'N/A'}</span></div>
            <div className="flex justify-between"><span className="text-muted">Flooring</span><span>{listing.flooring || 'N/A'}</span></div>
            <div className="flex justify-between"><span className="text-muted">Electricity</span><span>{listing.electricity || 'N/A'}</span></div>
            <div className="flex justify-between"><span className="text-muted">Water</span><span>{listing.water || 'N/A'}</span></div>
          </div>
        </div>

        {/* Status */}
        <div className="flex gap-2">
          <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">✓ {listing.status}</span>
          <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">✓ Verified</span>
        </div>

        {/* Actions */}
        {user && (
          <div className="space-y-2">
            <button className="w-full py-3 bg-primary text-white rounded-xl font-semibold">
              📅 Request Inspection
            </button>
            <button onClick={handleCall} className="w-full py-3 bg-white border-2 border-primary text-primary rounded-xl font-semibold">
              📞 Call Landlord
            </button>
            <button onClick={handleWhatsApp} className="w-full py-3 bg-white border-2 border-primary text-primary rounded-xl font-semibold">
              💬 WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
