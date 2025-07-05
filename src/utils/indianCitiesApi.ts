// Indian Cities API utility functions
// Using local JSON data for reliability since external APIs are not working

export interface City {
  city: string;
  state: string;
  district: string;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

// Local JSON data - always reliable
import localData from '@/constants/indian_states_cities.json';

/**
 * Convert local JSON data to the expected format
 */
const convertLocalData = (): City[] => {
  const cities: City[] = [];
  Object.entries(localData).forEach(([state, cityList]) => {
    if (Array.isArray(cityList)) {
      cityList.forEach(city => {
        cities.push({
          city,
          state,
          district: '' // Local data doesn't have district info
        });
      });
    }
  });
  return cities;
};

/**
 * Fetch all cities from local data (reliable fallback)
 */
export const fetchAllCities = async (): Promise<City[]> => {
  try {
    console.log('Using local Indian states and cities data');
    return convertLocalData();
  } catch (error) {
    console.error('Error loading local data:', error);
    throw new Error('Failed to load cities data');
  }
};

/**
 * Fetch all unique states from local data
 */
export const fetchAllStates = async (): Promise<string[]> => {
  try {
    const states = Object.keys(localData).sort();
    console.log('Loaded states from local data:', states.length);
    return states;
  } catch (error) {
    console.error('Error fetching states:', error);
    throw new Error('Failed to fetch states data');
  }
};

/**
 * Fetch cities for a specific state from local data
 */
export const fetchCitiesByState = async (stateName: string): Promise<string[]> => {
  try {
    const stateCities = localData[stateName as keyof typeof localData];
    
    if (Array.isArray(stateCities)) {
      console.log(`Loaded ${stateCities.length} cities for ${stateName}`);
      return stateCities.sort();
    }
    
    console.warn(`No cities found for state: ${stateName}`);
    return [];
  } catch (error) {
    console.error(`Error fetching cities for state ${stateName}:`, error);
    return [];
  }
};

/**
 * Search cities by name (client-side filtering)
 */
export const searchCities = async (searchTerm: string, stateFilter?: string): Promise<City[]> => {
  try {
    const cities = convertLocalData();
    
    let filteredCities = cities;
    
    // Filter by state if provided
    if (stateFilter) {
      filteredCities = filteredCities.filter(city => 
        city.state.toLowerCase().includes(stateFilter.toLowerCase())
      );
    }
    
    // Filter by search term
    if (searchTerm) {
      filteredCities = filteredCities.filter(city => 
        city.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.state.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filteredCities;
  } catch (error) {
    console.error('Error searching cities:', error);
    throw new Error('Failed to search cities');
  }
}; 