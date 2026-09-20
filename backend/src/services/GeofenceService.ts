// Haversine formula to calculate distance between two GPS coordinates in meters
function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Radius of the earth in meters
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in meters
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

// Define our mining zones with central GPS coordinates and a radius in meters
export const GEO_ZONES = [
  { id: 'Z-01', name: 'Zone A', lat: 23.7500, lng: 86.4200, radiusMeters: 100 },
  { id: 'Z-02', name: 'Intersection', lat: 23.7550, lng: 86.4250, radiusMeters: 150 },
  { id: 'Z-03', name: 'Haul Road Crossing', lat: 23.7600, lng: 86.4300, radiusMeters: 100 }
];

export class GeofenceService {
  /**
   * Checks a GPS coordinate against all defined zones.
   * Returns the Zone ID if the vehicle is inside a zone, or null if it's on an unmonitored road.
   */
  public static getZoneForCoordinate(lat: number, lng: number): string | null {
    for (const zone of GEO_ZONES) {
      const distance = getDistanceFromLatLonInM(lat, lng, zone.lat, zone.lng);
      if (distance <= zone.radiusMeters) {
        return zone.id; // Vehicle is inside this zone's geofence
      }
    }
    return null; // Vehicle is outside all defined zones
  }
}
