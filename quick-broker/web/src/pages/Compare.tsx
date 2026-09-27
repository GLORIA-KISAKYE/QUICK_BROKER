import { useState } from 'react';

interface Listing {
  id: string;
  title: string;
  house_type: string;
  rent_amount: number;
  area: string;
  distance_from_kiu: number;
  transport_time_boda: number;
  electricity: string;
  water: string;
  kitchen: string;
  bathroom: string;
  toilet: string;
}

export default function Compare() {
  const [listings] = useState<Listing[]>([
    {
      id: '1',
      title: 'House A',
      house_type: 'DOUBLE_ROOM',
      rent_amount: 280000,
      area: 'Kakoba',
      distance_from_kiu: 1.2,
      transport_time_boda: 8,
      electricity: 'SHARED_BILL',
      water: 'COMMUNITY_TAP',
      kitchen: 'PRESENT',
      bathroom: 'SHARED',
      toilet: 'SHARED',
    },
    {
      id: '2',
      title: 'House B',
      house_type: 'SELF_CONTAINED_SINGLE',
      rent_amount: 350000,
      area: 'Ishaka Town',
      distance_from_kiu: 0.8,
      transport_time_boda: 5,
      electricity: 'PERSONAL_BILL',
      water: 'INCLUDED',
      kitchen: 'PRESENT',
      bathroom: 'PRIVATE',
      toilet: 'PRIVATE',
    },
  ]);

  const features = [
    { key: 'rent_amount', label: 'Rent', format: (v: number) => `UGX ${v.toLocaleString()}` },
    { key: 'distance_from_kiu', label: 'Distance', format: (v: number) => `${v} km` },
    { key: 'transport_time_boda', label: 'Boda Time', format: (v: number) => `${v} min` },
    { key: 'house_type', label: 'Type', format: (v: string) => v.replace(/_/g, ' ') },
    { key: 'kitchen', label: 'Kitchen', format: (v: string) => v || 'N/A' },
    { key: 'bathroom', label: 'Bathroom', format: (v: string) => v || 'N/A' },
    { key: 'toilet', label: 'Toilet', format: (v: string) => v || 'N/A' },
    { key: 'electricity', label: 'Electricity', format: (v: string) => v || 'N/A' },
    { key: 'water', label: 'Water', format: (v: string) => v || 'N/A' },
  ];

  return (
    <div className="min-h-screen bg-accent pb-20">
      <div className="bg-gradient-to-r from-primary to-secondary p-4">
        <h1 className="text-white text-xl font-bold">Compare Houses</h1>
      </div>

      <div className="p-3 overflow-x-auto">
        <table className="w-full text-xs border-collapse min-w-[280px]">
          <thead>
            <tr>
              <th className="text-left p-2 text-muted border-b-2 border-primary">Feature</th>
              {listings.map((l) => (
                <th key={l.id} className="p-2 border-b-2 border-primary">🏠 {l.title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((f) => (
              <tr key={f.key}>
                <td className="p-2 text-muted">{f.label}</td>
                {listings.map((l) => (
                  <td key={l.id} className="p-2 text-center">
                    {f.format((l as Record<string, unknown>)[f.key] as never)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex gap-2 mt-3">
          {listings.map((l) => (
            <button key={l.id} className="flex-1 py-2 bg-primary text-white rounded-xl text-sm font-semibold">
              📅 Inspect {l.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
