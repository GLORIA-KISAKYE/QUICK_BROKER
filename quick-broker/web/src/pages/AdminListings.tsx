import { useState, useEffect } from 'react';
import { api } from '../utils/api';

interface Listing {
  id: string;
  title: string;
  house_type: string;
  rent_amount: number;
  area: string;
  status: string;
  landlord_phone: string;
}

export default function AdminListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    house_type: 'SINGLE_ROOM',
    rent_amount: '',
    area: '',
    landlord_phone: '',
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
      const data = await api<{ data: Listing[] }>('/admin/listings', { auth: true });
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
      await api('/listings', {
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
      await api(`/listings/${id}`, { method: 'PATCH', auth: true, body: { status } });
      fetchListings();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  return (
    <div className="min-h-screen bg-accent">
      <div className="bg-white p-4 border-b border-border flex justify-between items-center">
        <h1 className="text-text text-xl font-bold">Manage Listings</h1>
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
            <input
              type="tel"
              placeholder="Landlord Phone"
              value={form.landlord_phone}
              onChange={(e) => setForm({ ...form, landlord_phone: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-border text-sm"
            />
            <button type="submit" className="w-full py-2 bg-primary text-white rounded-xl font-semibold">
              Create Listing
            </button>
          </form>
        )}

        {loading ? (
          <div className="text-center py-8 text-muted">Loading...</div>
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
                  <select
                    value={listing.status}
                    onChange={(e) => handleStatusChange(listing.id, e.target.value)}
                    className="px-2 py-1 rounded-lg border border-border text-xs"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="INSPECTION_PENDING">Inspection Pending</option>
                    <option value="OCCUPIED">Occupied</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
