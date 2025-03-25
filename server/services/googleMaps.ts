import { Client, TravelMode, DirectionsRequest } from '@googlemaps/google-maps-services-js';

// Initialize the Google Maps client
const client = new Client({});

/**
 * Get route distance and duration using Google Maps Directions API
 * @param origin Origin coordinates [lat, lng] or address string
 * @param destination Destination coordinates [lat, lng] or address string
 * @param mode Travel mode (driving, walking, bicycling, transit)
 * @returns Promise with distance in kilometers and duration in seconds
 */
export async function getRouteDetails(
  origin: string | [number, number],
  destination: string | [number, number],
  mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
): Promise<{ distance: number; duration: number; polyline: string }> {
  try {
    // Check if API key is available
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error("Google Maps API key is missing. Please set the GOOGLE_MAPS_API_KEY environment variable.");
    }

    // Format origin and destination to string format for Google Maps API
    const originStr = Array.isArray(origin) ? `${origin[0]},${origin[1]}` : origin;
    const destinationStr = Array.isArray(destination) ? `${destination[0]},${destination[1]}` : destination;

    // Set up request parameters
    const request: DirectionsRequest = {
      params: {
        origin: originStr,
        destination: destinationStr,
        mode: mode.toLowerCase() as TravelMode, // Must be lowercase for the API
        key: apiKey
      }
    };

    // Make the API call
    const response = await client.directions(request);
    const data = response.data;

    if (data.status === 'REQUEST_DENIED') {
      const errorMsg = data.error_message || 'Request denied';
      console.error("Google Maps API error:", errorMsg);
      throw new Error(`API key is not authorized for Directions API. Please enable the Directions API in the Google Cloud Console for this API key.`);
    }
    
    if (data.status !== 'OK' || !data.routes.length) {
      throw new Error(`Google Maps API error: ${data.status}`);
    }

    // Extract route information
    const route = data.routes[0];
    const legs = route.legs[0];
    
    // Convert distance from meters to kilometers
    const distanceInKm = (legs.distance.value / 1000);
    
    // Duration in seconds
    const durationInSeconds = legs.duration.value;

    // Extract encoded polyline for route visualization
    const polyline = route.overview_polyline.points;

    return {
      distance: distanceInKm,
      duration: durationInSeconds,
      polyline: polyline
    };
  } catch (error) {
    console.error('Error getting route details from Google Maps API:', error);
    throw error;
  }
}

/**
 * Decode a Google Maps encoded polyline to an array of coordinates
 * @param encoded Encoded polyline string
 * @returns Array of [lng, lat] coordinates
 */
export function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;
    
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    // Convert to degrees / 1e5 and convert to [lng, lat] format
    points.push([lng * 1e-5, lat * 1e-5]);
  }

  return points;
}

/**
 * Get optimized routes using Google Maps Directions API
 * This is an enhanced version that tries alternative routes and selects the best
 * @param origin Origin coordinates [lat, lng] or address string
 * @param destination Destination coordinates [lat, lng] or address string
 * @param optimizationLevel Level of optimization (0-100)
 * @returns Promise with optimized route details
 */
export async function getOptimizedRoute(
  origin: string | [number, number],
  destination: string | [number, number],
  optimizationLevel: number = 85
): Promise<{
  distance: number;
  duration: number;
  polyline: string;
  coordinates: [number, number][];
  savings: {
    distance: number;
    duration: number;
    percentage: number;
  };
}> {
  try {
    // Check if API key is available
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error("Google Maps API key is missing. Please set the GOOGLE_MAPS_API_KEY environment variable.");
    }

    // Format origin and destination
    const originStr = Array.isArray(origin) ? `${origin[0]},${origin[1]}` : origin;
    const destinationStr = Array.isArray(destination) ? `${destination[0]},${destination[1]}` : destination;

    // Get baseline route (without optimization)
    const baselineRequest: DirectionsRequest = {
      params: {
        origin: originStr,
        destination: destinationStr,
        mode: 'driving' as TravelMode,
        key: apiKey
      }
    };

    const baselineResponse = await client.directions(baselineRequest);
    
    if (baselineResponse.data.status === 'REQUEST_DENIED') {
      const errorMsg = baselineResponse.data.error_message || 'Request denied';
      console.error("Google Maps API error:", errorMsg);
      throw new Error(`API key is not authorized for Directions API. Please enable the Directions API in the Google Cloud Console for this API key.`);
    }
    
    if (baselineResponse.data.status !== 'OK' || !baselineResponse.data.routes.length) {
      throw new Error(`Google Maps API error: ${baselineResponse.data.status}`);
    }

    const baselineRoute = baselineResponse.data.routes[0];
    const baselineDistance = baselineRoute.legs[0].distance.value / 1000; // km
    const baselineDuration = baselineRoute.legs[0].duration.value; // seconds

    // Now request optimized route with alternatives
    const optimizedRequest: DirectionsRequest = {
      params: {
        origin: originStr,
        destination: destinationStr,
        mode: 'driving' as TravelMode,
        alternatives: true, // Request alternative routes
        key: apiKey // Use the validated API key
      }
    };

    const optimizedResponse = await client.directions(optimizedRequest);
    
    if (optimizedResponse.data.status === 'REQUEST_DENIED') {
      const errorMsg = optimizedResponse.data.error_message || 'Request denied';
      console.error("Google Maps API error:", errorMsg);
      throw new Error(`API key is not authorized for Directions API. Please enable the Directions API in the Google Cloud Console for this API key.`);
    }
    
    if (optimizedResponse.data.status !== 'OK' || !optimizedResponse.data.routes.length) {
      throw new Error(`Google Maps API error: ${optimizedResponse.data.status}`);
    }

    // Select the best route based on distance and travel time
    // Weight the selection based on the optimization level
    const routes = optimizedResponse.data.routes;
    let bestRoute = routes[0];
    let bestScore = Number.MAX_VALUE;

    const distanceWeight = optimizationLevel / 100;
    const timeWeight = 1 - distanceWeight;

    for (const route of routes) {
      const distance = route.legs[0].distance.value;
      const duration = route.legs[0].duration.value;
      
      // Normalize and score (lower is better)
      const distanceScore = distance / 1000; // Convert to km
      const durationScore = duration / 60; // Convert to minutes
      
      // Combined score weighted by optimization preference
      const score = (distanceScore * distanceWeight) + (durationScore * timeWeight);
      
      if (score < bestScore) {
        bestScore = score;
        bestRoute = route;
      }
    }

    // Extract details from the best route
    const optimizedDistance = bestRoute.legs[0].distance.value / 1000; // km
    const optimizedDuration = bestRoute.legs[0].duration.value; // seconds
    const polyline = bestRoute.overview_polyline.points;
    
    // Decode the polyline to get coordinate points for visualization
    const coordinates = decodePolyline(polyline);

    // Calculate savings
    const distanceSaving = baselineDistance - optimizedDistance;
    const durationSaving = baselineDuration - optimizedDuration;
    const savingPercentage = (distanceSaving / baselineDistance) * 100;

    return {
      distance: optimizedDistance,
      duration: optimizedDuration,
      polyline: polyline,
      coordinates: coordinates,
      savings: {
        distance: distanceSaving,
        duration: durationSaving,
        percentage: savingPercentage
      }
    };
  } catch (error) {
    console.error('Error getting optimized route from Google Maps API:', error);
    throw error;
  }
}