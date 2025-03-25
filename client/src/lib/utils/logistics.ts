// Utility functions for logistics calculations

/**
 * Calculate the distance between two points on Earth (using Haversine formula)
 * @param lat1 Latitude of point 1 (in degrees)
 * @param lon1 Longitude of point 1 (in degrees)
 * @param lat2 Latitude of point 2 (in degrees)
 * @param lon2 Longitude of point 2 (in degrees)
 * @returns Distance in kilometers
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = degToRad(lat2 - lat1);
  const dLon = degToRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  
  return distance;
}

/**
 * Convert degrees to radians
 * @param degrees Angle in degrees
 * @returns Angle in radians
 */
function degToRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate the cost of a route based on distance, transport type, and fuel costs
 * @param distance Distance in kilometers
 * @param transportType Type of transport (Air, Ground, Maritime, etc.)
 * @returns Cost in USD
 */
export function calculateRouteCost(distance: number, transportType: string): number {
  // Cost per km by transport type (in USD)
  const costPerKm: Record<string, number> = {
    "Air": 4.5,
    "Ground": 1.2,
    "Maritime": 0.5,
    "Ground/Air": 3.0
  };
  
  const defaultCost = 2.0; // Default cost per km
  const costRate = costPerKm[transportType] || defaultCost;
  
  return distance * costRate;
}

/**
 * Estimate the time required for a route based on distance and transport type
 * @param distance Distance in kilometers
 * @param transportType Type of transport (Air, Ground, Maritime, etc.)
 * @returns Time in hours
 */
export function estimateRouteTime(distance: number, transportType: string): number {
  // Average speed by transport type (in km/h)
  const avgSpeed: Record<string, number> = {
    "Air": 800,
    "Ground": 70,
    "Maritime": 35,
    "Ground/Air": 400
  };
  
  const defaultSpeed = 100; // Default speed
  const speed = avgSpeed[transportType] || defaultSpeed;
  
  // Add loading/unloading time based on transport type
  const loadingTime: Record<string, number> = {
    "Air": 3,
    "Ground": 2,
    "Maritime": 12,
    "Ground/Air": 6
  };
  
  const defaultLoadingTime = 4;
  const additionalTime = loadingTime[transportType] || defaultLoadingTime;
  
  return (distance / speed) + additionalTime;
}
