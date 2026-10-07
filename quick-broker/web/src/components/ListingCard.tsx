import { useNavigate } from 'react-router-dom';

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

interface Props {
  listing: Listing;
}

export default function ListingCard({ listing }: Props) {
  const navigate = useNavigate();

  const formatRent = (amount: number) => {
    return `UGX ${amount.toLocaleString()}/month`;
  };

  const houseTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      SINGLE_ROOM: 'Single Room',
      DOUBLE_ROOM: 'Double Room',
      SELF_CONTAINED_SINGLE: 'Self-Cont. Single',
      SELF_CONTAINED_DOUBLE: 'Self-Cont. Double',
      OTHER: 'Other',
    };
    return labels[type] || type;
  };

  return (
    <div
      onClick={() => navigate(`/listing/${listing.id}`)}
      className="bg-white rounded-2xl overflow-hidden border border-border mb-3 cursor-pointer hover:shadow-md transition-all duration-200 listing-card"
    >
      <div className="h-32 bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-5xl relative">
        🏠
        <div className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center text-sm shadow">
          ❤️
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-bold text-sm text-text">{houseTypeLabel(listing.house_type)}</h3>
        <p className="text-primary font-bold text-base mt-0.5">{formatRent(listing.rent_amount)}</p>
        <p className="text-muted text-xs mt-0.5">
          {listing.distance_from_kiu} km from KIU · ~{listing.transport_time_boda} min boda
        </p>
        <p className="text-muted text-xs mt-0.5">{listing.area}</p>
        {listing.photos && listing.photos.length > 0 && (
          <p className="text-muted text-xs mt-1">📷 {listing.photos.length} photo(s)</p>
        )}
      </div>
    </div>
  );
}
