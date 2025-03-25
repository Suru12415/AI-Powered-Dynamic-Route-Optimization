import { type InsertRoute } from "@shared/schema";
import { calculateDistance } from "./logistics";
import { calculateCO2Emissions, calculateCO2Savings } from "./co2";

/**
 * Simple route optimization algorithm
 * @param route Route details including origin and destination coordinates
 * @param optimizationLevel Optimization level (0-100)
 * @param co2Priority Priority for CO2 reduction (Low, Medium, High)
 * @returns Optimized route data
 */
export function optimizeRoute(
  route: InsertRoute,
  optimizationLevel: number = 85,
  co2Priority: "Low" | "Medium" | "High" = "High"
): InsertRoute {
  if (!route.coordinates || route.coordinates.length < 2) {
    return route;
  }
  
  const originalRoute = { ...route };
  
  // Calculate direct distance between origin and destination
  const origin = route.coordinates[0];
  const destination = route.coordinates[route.coordinates.length - 1];
  
  const directDistance = calculateDistance(
    origin[1], origin[0], 
    destination[1], destination[0]
  );
  
  // The optimization factor depends on the optimization level (0-100)
  const optimizationFactor = optimizationLevel / 100;
  
  // CO2 priority factor
  const co2Factor = co2Priority === "High" ? 1.2 : co2Priority === "Medium" ? 1.0 : 0.8;
  
  // Simulate route optimization by reducing the distance
  const distanceReduction = route.distance * (optimizationFactor * 0.2);
  const optimizedDistance = route.distance - distanceReduction;
  
  // Increase efficiency based on optimization level
  const efficiencyIncrease = optimizationFactor * 10; // Maximum 10% increase
  const optimizedEfficiency = Math.min(98, route.efficiency + efficiencyIncrease);
  
  // Calculate CO2 savings based on the distance reduction and transport type
  const originalCO2 = calculateCO2Emissions(route.distance, route.transportType);
  const optimizedCO2 = calculateCO2Emissions(optimizedDistance, route.transportType);
  
  // Apply CO2 priority factor
  const co2Saved = (originalCO2 - optimizedCO2) * co2Factor;
  
  // Return optimized route
  return {
    ...route,
    distance: optimizedDistance,
    efficiency: optimizedEfficiency,
    co2Saved: co2Saved,
    optimized: true
  };
}

/**
 * Generate intermediate points for a route to visualize the path
 * @param originCoord Origin coordinates [lng, lat]
 * @param destCoord Destination coordinates [lng, lat]
 * @param numPoints Number of intermediate points to generate
 * @returns Array of coordinates for the path
 */
export function generateRoutePath(
  originCoord: [number, number],
  destCoord: [number, number],
  numPoints: number = 10
): [number, number][] {
  const path: [number, number][] = [originCoord];
  
  // Create a curved path between points by adding a "bulge"
  const midPoint: [number, number] = [
    (originCoord[0] + destCoord[0]) / 2,
    (originCoord[1] + destCoord[1]) / 2
  ];
  
  // Add some curvature by offsetting the midpoint
  const distance = calculateDistance(
    originCoord[1], originCoord[0],
    destCoord[1], destCoord[0]
  );
  
  // The bulge is proportional to the distance
  const bulgeFactor = distance / 30;
  
  // Calculate perpendicular direction to create bulge
  const dx = destCoord[0] - originCoord[0];
  const dy = destCoord[1] - originCoord[1];
  
  // Perpendicular vector
  const perpX = -dy;
  const perpY = dx;
  
  // Normalize and scale
  const length = Math.sqrt(perpX * perpX + perpY * perpY);
  const bulgeX = (perpX / length) * bulgeFactor;
  const bulgeY = (perpY / length) * bulgeFactor;
  
  const bulgePoint: [number, number] = [
    midPoint[0] + bulgeX,
    midPoint[1] + bulgeY
  ];
  
  // Generate the intermediate points using quadratic interpolation
  for (let i = 1; i < numPoints - 1; i++) {
    const t = i / numPoints;
    
    // Quadratic Bezier curve
    const x = (1 - t) * (1 - t) * originCoord[0] + 
              2 * (1 - t) * t * bulgePoint[0] + 
              t * t * destCoord[0];
              
    const y = (1 - t) * (1 - t) * originCoord[1] + 
              2 * (1 - t) * t * bulgePoint[1] + 
              t * t * destCoord[1];
              
    path.push([x, y]);
  }
  
  path.push(destCoord);
  
  return path;
}
