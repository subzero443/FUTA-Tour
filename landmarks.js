// Initial positions from published FUTA field surveys (2013 / campus street guide).
// These are approximate reference points, not current verified pedestrian entrances.
// Verify each with campus authorities or a fresh field survey before public navigation.
export const FUTA_CENTER = [7.3004, 5.1403];
export const LANDMARKS = [
  { id: 'north-gate', name: 'FUTA North Gate', category: 'Gate', lat: 7.30667, lng: 5.13963, description: 'A major entrance to the FUTA main campus.', featured: true },
  { id: 'south-gate', name: 'FUTA South Gate', category: 'Gate', lat: 7.29261, lng: 5.15070, description: 'Entrance near the southern side of campus.', featured: true },
  { id: 'great-hall', name: 'Great Hall', category: 'Academic', lat: 7.29586, lng: 5.14757, description: 'A landmark hall on the FUTA campus.', featured: true },
  { id: 'senate-roundabout', name: 'Senate Roundabout', category: 'Services', lat: 7.30316, lng: 5.13958, description: 'Central reference point by the Senate area.', featured: true },
  { id: 'new-senate', name: 'New Senate Building', category: 'Services', lat: 7.30201, lng: 5.13933, description: 'University administrative landmark.', featured: false },
  { id: 'akindeko-hostel', name: 'Akindeko Hostel', category: 'Hostel', lat: 7.29392, lng: 5.14919, description: 'Student hostel in the southern campus area.', featured: true },
  { id: 'jibowu-hostel', name: 'Jibowu Hostel', category: 'Hostel', lat: 7.30380, lng: 5.14139, description: 'Student accommodation near the North Gate side.', featured: false },
  { id: 'uba-bank', name: 'UBA / Campus Bank Area', category: 'Services', lat: 7.30016, lng: 5.14021, description: 'Campus banking reference point.', featured: false },
  { id: 'west-gate', name: 'FUTA West Gate',  category: 'Gate',  lat: 7.30150, lng: 5.12750, description: 'Western campus entry point, providing direct access to the School of Environmental Technology.', featured: true },
  {id: 'futascoop','name': 'FUTASCOOP Hostel', category: 'Hostel', lat: 7.30094, lng: 5.14330, description: 'Student hostel within FUTA.', featured: true},
  {id: 'sub',
  name: 'Student Union Building (SUB)',
  category: "Nearby",
  lat: 7.30231,
  lng: 5.13942,
  description : 'Student union activities and student services.',
  featured: true
},
{
  id: 'awosika-hostel',
  name: 'Awosika Hostel',
  category: 'Hostel',
  lat: 7.296194520915946,
  lng: 5.134485606444425,
  description: 'Female student accommodation on FUTA campus.',
  'featured': true
},
{
  id: 'adeboye-hostel',
  name: 'Adeboye Hostel',
  category: 'Hostel',
  lat:7.295198624774229,
  lng: 5.134750897970071,
  description: 'Male student accommodation on FUTA campus.',
  featured: true
}
];

export const categories = ['All', 'Academic', 'Gate', 'Hostel', 'Nearby'];
export function metersBetween(a, b) {
  const toRad = d => d * Math.PI / 180;
  const lat1 = toRad(a.lat), lat2 = toRad(b.lat);
  const dLat = lat2 - lat1, dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return Math.round(6371000 * 2 * Math.asin(Math.min(1, Math.sqrt(h))));
}
export function formatDistance(m) { return m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`; }
