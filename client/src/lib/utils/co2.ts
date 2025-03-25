/**
 * Calculate CO2 emissions for a given route
 * @param distance Distance in kilometers
 * @param transportType Type of transport (Air, Ground, Maritime, etc.)
 * @returns CO2 emissions in metric tons
 */
export function calculateCO2Emissions(distance: number, transportType: string): number {
  // CO2 emissions per km by transport type (in kg CO2 per km)
  const emissionsPerKm: Record<string, number> = {
    "Air": 0.25,
    "Ground": 0.096,
    "Maritime": 0.012,
    "Ground/Air": 0.18
  };
  
  const defaultEmission = 0.15; // Default emission factor
  const emissionFactor = emissionsPerKm[transportType] || defaultEmission;
  
  // Convert kg to metric tons (1000 kg = 1 metric ton)
  return (distance * emissionFactor) / 1000;
}

/**
 * Calculate CO2 savings by comparing original and optimized routes
 * @param originalDistance Original distance in kilometers
 * @param optimizedDistance Optimized distance in kilometers
 * @param transportType Type of transport (Air, Ground, Maritime, etc.)
 * @returns CO2 savings in metric tons
 */
export function calculateCO2Savings(
  originalDistance: number, 
  optimizedDistance: number, 
  transportType: string
): number {
  const originalEmissions = calculateCO2Emissions(originalDistance, transportType);
  const optimizedEmissions = calculateCO2Emissions(optimizedDistance, transportType);
  
  return originalEmissions - optimizedEmissions;
}

/**
 * Calculate fuel consumption for a given route
 * @param distance Distance in kilometers
 * @param transportType Type of transport (Air, Ground, Maritime, etc.)
 * @returns Fuel consumption in liters
 */
export function calculateFuelConsumption(distance: number, transportType: string): number {
  // Fuel consumption per km by transport type (in liters per km)
  const fuelPerKm: Record<string, number> = {
    "Air": 5.2,
    "Ground": 0.35,
    "Maritime": 0.04,
    "Ground/Air": 3.0
  };
  
  const defaultConsumption = 1.0; // Default consumption
  const consumptionRate = fuelPerKm[transportType] || defaultConsumption;
  
  return distance * consumptionRate;
}

/**
 * Convert CO2 savings to equivalent number of trees planted
 * @param co2Saved CO2 saved in metric tons
 * @returns Equivalent number of trees
 */
export function co2ToTreesEquivalent(co2Saved: number): number {
  // Average tree absorbs about 22 kg of CO2 per year
  const co2AbsorbedPerTreePerYear = 0.022; // in metric tons
  
  return Math.round(co2Saved / co2AbsorbedPerTreePerYear);
}

/**
 * Calculate the environmental impact score (0-100) based on CO2 savings
 * @param co2Saved CO2 saved in metric tons
 * @param distance Distance in kilometers
 * @returns Environmental impact score (0-100)
 */
export function calculateEnvironmentalImpactScore(co2Saved: number, distance: number): number {
  // Base the score on CO2 saved per km, scaled to 0-100
  const efficiency = (co2Saved * 1000) / distance; // CO2 saved in kg per km
  
  // Scale based on typical efficiency values
  // 0.001 kg/km is very low efficiency, 0.1 kg/km is very high
  const scaledScore = Math.min(100, Math.max(0, efficiency * 1000));
  
  return Math.round(scaledScore);
}
