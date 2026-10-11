import { useState, useEffect } from 'react';
import { api } from '../utils/api';

interface Listing {
  id: string;
  title: string;
  house_type: string;
  rent_amount: number;
  area: string;
  status: string;
  photos: string[];
}

export default function LandlordListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    house_type: 'SINGLE_ROOM',
    rent_amount: '',
    area: '',
    electricity: '',
    water: '',
    kitchen: '',
    bathroom: '',
    toilet: '',
  });

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const data = await api<{ data: Listing[] }>('/landlord/listings', { auth: true });
      setListings(data.data);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api('/landlord/listings', {
        method: 'POST',
        auth: true,
        body: { ...form, rent_amount: Number(form.rent_amount) },
      });
      setShowForm(false);
      fetchListings();
    } catch (error) {
      console.error('Failed to create listing:', error);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api(`/landlord/listings/${id}`, { method: 'PATCH', auth: true, body: { status } });
      fetchListings();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api(`/landlord/listings/${id}`, { method: 'DELETE', auth: true });
      fetchListings();
    } catch (error) {
      console.error('Failed to delete listing:', error);
    }
  };

  return (
    <div className="min-h-screen bg-accent">
      <div className="bg-white p-4 border-b border-border flex justify-between items-center">
        <h1 className="text-text text-xl font-bold">My Listings</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1 bg-primary text-white rounded-lg text-sm font-semibold"
        >
          {showForm ? 'Cancel' : '+ New'}
        </button>
      </div>

      <div className="p-4">
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 border border-border mb-4 space-y-3">
            <input
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-border text-sm"
              required
            />
            <select
              value={form.house_type}
              onChange={(e) => setForm({ ...form, house_type: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-border text-sm"
            >
              <option value="SINGLE_ROOM">Single Room</option>
              <option value="DOUBLE_ROOM">Double Room</option>
              <option value="SELF_CONTAINED_SINGLE">Self-Contained Single</option>
              <option value="SELF_CONTAINED_DOUBLE">Self-Contained Double</option>
              <option value="OTHER">Other</option>
            </select>
            <input
              type="number"
              placeholder="Rent (UGX/month)"
              value={form.rent_amount}
              onChange={(e) => setForm({ ...form, rent_amount: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-border text-sm"
              required
            />
            <input
              type="text"
              placeholder="Area"
              value={form.area}
              onChange={(e) => setForm({ ...form, area: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-border text-sm"
              required
            />
            <select
              value={form.electricity}
              onChange={(e) => setForm({ ...form, electricity: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-border text-sm"
            >
              <option value="">Electricity (optional)</option>
              <option value="INCLUDED">Included</option>
              <option value="SHARED_BILL">Shared bill</option>
              <option value="PERSONAL_BILL">Personal bill</option>
            </select>
            <select
              value={form.water}
              onChange={(e) => setForm({ ...form, water: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-border text-sm"
            >
              <option value="">Water (optional)</option>
              <option value="INCLUDED">Included</option>
              <option value="SHARED_PAYMENT">Shared payment</option>
              <option value="STUDENT_PAYS">Student pays</option>
              <option value="COMMUNITY_TAP">Community tap</option>
            </select>
            <button type="submit" className="w-full py-2 bg-primary text-white rounded-xl font-semibold">
              Create Listing
            </button>
          </form>
        )}

        {loading ? (
          <div className="text-center py-8 text-muted">Loading...</div>
        ) : listings.length === 0 ? (
          <div className="text-center py-8 text-muted">No listings yet</div>
        ) : (
          <div className="space-y-3">
            {listings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-2xl p-4 border border-border">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm">{listing.title}</h3>
                    <p className="text-muted text-xs">{listing.area} · {listing.house_type.replace(/_/g, ' ')}</p>
                    <p className="text-primary font-bold text-sm">UGX {listing.rent_amount.toLocaleString()}/mo</p>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={listing.status}
                      onChange={(e) => handleStatusChange(listing.id, e.target.value)}
                      className="px-2 py-1 rounded-lg border border-border text-xs"
                    >
                      <option value="AVAILABLE">Available</option>
                      <option value="INSPECTION_PENDING">Inspection Pending</option>
                      <option value="OCCUPIED">Occupied</option>
                    </select>
                    <button
                      onClick={() => handleDelete(listing.id)}
                      className="px-2 py-1 bg-red-500 text-white rounded-lg text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
