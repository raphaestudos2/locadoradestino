import { LocationService, Location } from '../services/locationService';

// Cache for locations
let locationsCache: Location[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 30000; // 30 seconds

// Get location name by ID
export const getLocationName = async (locationId: string): Promise<string> => {
  try {
    const locations = await getOrderedLocations();
    const location = locations.find(l => l.id === locationId);
    return location?.name || locationId;
  } catch (error) {
    console.error('Error getting location name:', error);
    return locationId;
  }
};

// Get location address by ID
export const getLocationAddress = async (locationId: string): Promise<string> => {
  try {
    const locations = await getOrderedLocations();
    const location = locations.find(l => l.id === locationId);
    return location?.address || '';
  } catch (error) {
    console.error('Error getting location address:', error);
    return '';
  }
};

// Get locations by state
export const getLocationsByState = async (state: string): Promise<Location[]> => {
  try {
    return await LocationService.getByState(state);
  } catch (error) {
    console.error('Error getting locations by state:', error);
    return [];
  }
};

// Get all active locations ordered
export const getOrderedLocations = async (): Promise<Location[]> => {
  try {
    // Check cache first
    const now = Date.now();
    if (locationsCache && (now - cacheTimestamp) < CACHE_DURATION) {
      return locationsCache;
    }

    // Fetch fresh data
    const locations = await LocationService.getActiveLocations();
    
    // Update cache
    locationsCache = locations;
    cacheTimestamp = now;
    
    return locations;
  } catch (error) {
    console.error('Error getting ordered locations:', error);
    
    // Return static fallback if all else fails
    return [
      {
        id: 'rio-centro-rj',
        name: 'Rio de Janeiro - RJ',
        address: 'Rio de Janeiro - RJ',
        city: 'Rio de Janeiro',
        state: 'RJ',
        active: true,
        displayOrder: 1
      },
      {
        id: 'galeao-rj',
        name: 'Aeroporto Internacional do Galeão - RJ',
        address: 'Aeroporto Internacional do Galeão - Rio de Janeiro - RJ',
        city: 'Rio de Janeiro',
        state: 'RJ',
        active: true,
        displayOrder: 2
      }
    ];
  }
};

// Synchronous version for backward compatibility (uses cache or fallback)
export const getOrderedLocationsSync = (): Location[] => {
  if (locationsCache) {
    return locationsCache;
  }
  
  // Return static fallback for immediate use
  return [
    {
      id: 'rio-centro-rj',
      name: 'Rio de Janeiro - RJ',
      address: 'Rio de Janeiro - RJ',
      city: 'Rio de Janeiro',
      state: 'RJ',
      active: true,
      displayOrder: 1
    },
    {
      id: 'galeao-rj',
      name: 'Aeroporto Internacional do Galeão - RJ',
      address: 'Aeroporto Internacional do Galeão - Rio de Janeiro - RJ',
      city: 'Rio de Janeiro',
      state: 'RJ',
      active: true,
      displayOrder: 2
    }
  ];
};

// Clear cache (useful when locations are updated)
export const clearLocationsCache = (): void => {
  locationsCache = null;
  cacheTimestamp = 0;
};

// Load initial cache
export const preloadLocations = async (): Promise<void> => {
  try {
    await getOrderedLocations();
  } catch (error) {
    console.error('Error preloading locations:', error);
  }
};