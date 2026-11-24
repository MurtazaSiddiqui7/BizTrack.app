import { ShopDistributionSummary } from '../types';

export interface RouteStop {
  order: number;
  summary: ShopDistributionSummary;
  distanceFromPreviousKm?: number;
  estimatedMinutes?: number;
}

export interface RoutePlan {
  stops: RouteStop[];
  totalDistanceKm: number;
  totalBoxesToDeliver: number;
  totalFlavoursToDeliver: number;
  estimatedTotalMinutes: number;
}

/**
 * Calculates straight line distance (Haversine formula) in kilometers between two GPS coordinates
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Smart Route Planner:
 * Takes pending and partial shops and optimizes the visiting order
 * using a Greedy Nearest Neighbor heuristic or locality clustering.
 */
export function planDeliveryRoute(
  summaries: ShopDistributionSummary[],
  options?: {
    startLat?: number;
    startLng?: number;
    localityFilter?: string;
  }
): RoutePlan {
  // Only route shops that actually need deliveries
  let activeStops = summaries.filter(s => s.status === 'pending' || s.status === 'partial');

  if (options?.localityFilter && options.localityFilter !== 'all') {
    activeStops = activeStops.filter(s => s.shop.locality.toLowerCase() === options.localityFilter?.toLowerCase());
  }

  if (activeStops.length === 0) {
    return {
      stops: [],
      totalDistanceKm: 0,
      totalBoxesToDeliver: 0,
      totalFlavoursToDeliver: 0,
      estimatedTotalMinutes: 0
    };
  }

  // Base location (Hyderabad central hub or user GPS)
  let currentLat = options?.startLat || activeStops[0].shop.lat || 17.3850;
  let currentLng = options?.startLng || activeStops[0].shop.lng || 78.4867;

  const unvisited = [...activeStops];
  const orderedStops: RouteStop[] = [];
  let totalKm = 0;

  let stopNumber = 1;
  while (unvisited.length > 0) {
    // Find closest unvisited shop
    let bestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const s = unvisited[i];
      const dist = calculateDistanceKm(currentLat, currentLng, s.shop.lat, s.shop.lng);
      if (dist < minDistance) {
        minDistance = dist;
        bestIndex = i;
      }
    }

    const nextShop = unvisited.splice(bestIndex, 1)[0];
    const distanceKm = minDistance === Infinity ? 0 : minDistance;
    // Estimated travel time in city traffic (avg 20 km/h) + 15 min unloading per shop
    const travelMins = Math.round((distanceKm / 20) * 60);
    const stopMins = travelMins + 15;

    totalKm += distanceKm;

    orderedStops.push({
      order: stopNumber++,
      summary: nextShop,
      distanceFromPreviousKm: distanceKm,
      estimatedMinutes: stopMins
    });

    currentLat = nextShop.shop.lat;
    currentLng = nextShop.shop.lng;
  }

  const totalBoxes = orderedStops.reduce((sum, stop) => sum + stop.summary.totalRemainingBoxes, 0);
  const totalFlavours = orderedStops.reduce(
    (sum, stop) => sum + stop.summary.flavourDetails.filter(f => !f.isFlavourCompleted).length,
    0
  );
  const totalMinutes = orderedStops.reduce((sum, stop) => sum + (stop.estimatedMinutes || 15), 0);

  return {
    stops: orderedStops,
    totalDistanceKm: Math.round(totalKm * 10) / 10,
    totalBoxesToDeliver: totalBoxes,
    totalFlavoursToDeliver: totalFlavours,
    estimatedTotalMinutes: totalMinutes
  };
}

/**
 * Creates Google Maps directions URL for an individual shop or multi-stop route
 */
export function getDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function getFullRouteMapUrl(stops: RouteStop[]): string {
  if (stops.length === 0) return 'https://maps.google.com';
  const waypoints = stops.slice(0, stops.length - 1).map(s => `${s.summary.shop.lat},${s.summary.shop.lng}`).join('|');
  const destination = `${stops[stops.length - 1].summary.shop.lat},${stops[stops.length - 1].summary.shop.lng}`;
  return `https://www.google.com/maps/dir/?api=1&waypoints=${encodeURIComponent(waypoints)}&destination=${encodeURIComponent(destination)}`;
}
