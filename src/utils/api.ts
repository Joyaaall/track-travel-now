// Types for bus stop and bus data
export interface BusStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface Bus {
  id: number;
  from: string;
  to: string;
  type: "AC" | "Express" | "Ordinary";
  departure: string;
  arrival: string;
  stops: string[];
  stopLocations?: Array<{lat: number, lng: number}>;
}

// Define the Depot interface for KSRTC depots
export interface Depot {
  id: string;
  name: string;
  type: string;
  address: string;
  facilities: string[];
  lat: number;
  lng: number;
  distance?: number;
}

// Error message constants
export const ERROR_MESSAGES = {
  overpass_fail: 'Bus stop data unavailable. Using cached data...',
  kbuses_fail: 'Route information temporarily unavailable',
  location_fail: 'Enable location services for accurate results',
  network_fail: 'Network connection required'
};

// Cache management
const CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour in ms

const getCache = (key: string) => {
  const cached = localStorage.getItem(key);
  if (!cached) return null;
  
  try {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch (error) {
    localStorage.removeItem(key);
    return null;
  }
};

const setCache = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify({
    data,
    timestamp: Date.now()
  }));
};

// Sample data for when APIs aren't available
export const sampleBusData: Bus[] = [
  {
    id: 1,
    from: "Ernakulam",
    to: "Kozhikode",
    type: "AC",
    departure: "10:30 AM",
    arrival: "3:45 PM",
    stops: ["Kalamassery", "Thrissur", "Shornur"],
  },
  {
    id: 2,
    from: "Ernakulam",
    to: "Thiruvananthapuram",
    type: "Express",
    departure: "9:00 AM",
    arrival: "1:30 PM",
    stops: ["Alappuzha", "Kollam"]
  },
  {
    id: 3,
    from: "Kottayam",
    to: "Kozhikode",
    type: "Ordinary",
    departure: "7:15 AM",
    arrival: "4:30 PM",
    stops: ["Ernakulam", "Thrissur", "Palakkad", "Malappuram"]
  },
  {
    id: 4,
    from: "Thiruvananthapuram",
    to: "Kannur",
    type: "AC",
    departure: "8:00 PM",
    arrival: "6:30 AM",
    stops: ["Kollam", "Alappuzha", "Ernakulam", "Thrissur", "Kozhikode"],
  },
  {
    id: 5,
    from: "Thrissur",
    to: "Ernakulam",
    type: "Ordinary",
    departure: "7:00 AM",
    arrival: "9:30 AM",
    stops: ["Chalakudy", "Angamaly", "Kalamassery"]
  }
];

export const sampleBusStops: BusStop[] = [
  { id: "stop1", name: "Ernakulam Bus Terminal", lat: 9.9816, lng: 76.2999 },
  { id: "stop2", name: "Kalamassery Stop", lat: 10.0523, lng: 76.3305 },
  { id: "stop3", name: "Thrissur Bus Station", lat: 10.5276, lng: 76.2144 },
  { id: "stop4", name: "Shornur Junction", lat: 10.7618, lng: 76.2421 },
  { id: "stop5", name: "Kozhikode KSRTC", lat: 11.2588, lng: 75.7804 },
  { id: "stop6", name: "Alappuzha Bus Station", lat: 9.4981, lng: 76.3388 },
  { id: "stop7", name: "Kollam KSRTC", lat: 8.8932, lng: 76.5709 },
  { id: "stop8", name: "Thiruvananthapuram Central", lat: 8.4855, lng: 76.9492 },
  { id: "stop9", name: "Kottayam Bus Stand", lat: 9.5916, lng: 76.5222 },
  { id: "stop10", name: "Palakkad Bus Terminal", lat: 10.7867, lng: 76.6548 },
  { id: "stop11", name: "Malappuram Bus Stand", lat: 11.0731, lng: 76.0744 },
  { id: "stop12", name: "Kannur KSRTC", lat: 11.8745, lng: 75.3704 },
  { id: "stop13", name: "Chalakudy Bus Stand", lat: 10.3004, lng: 76.3390 },
  { id: "stop14", name: "Angamaly Bus Stop", lat: 10.1960, lng: 76.3861 }
];

// Process Overpass API response
const processOverpassData = (data: any): BusStop[] => {
  return data.elements.map((item: any) => ({
    id: item.id.toString(),
    name: item.tags?.name || 'Unnamed Stop',
    lat: item.lat,
    lng: item.lon
  }));
};

// Process KBuses API response 
const processKBusesData = (data: any): Bus[] => {
  return data.map((bus: any) => ({
    id: bus.id,
    from: bus.source,
    to: bus.destination,
    type: bus.type === 'AC' ? 'AC' : bus.isExpress ? 'Express' : 'Ordinary',
    departure: bus.departureTime,
    arrival: bus.arrivalTime,
    stops: bus.intermediateStops || []
  }));
};

// Function to get user's current location
export const getUserLocation = (): Promise<[number, number]> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error(ERROR_MESSAGES.location_fail));
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        console.error("Error getting location:", error);
        // Default to Ernakulam, Kerala
        resolve([9.9816, 76.2999]);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  });
};

// Retry function for API calls
const withRetry = async <T>(fn: () => Promise<T>, attempts = 3): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (attempts <= 1) throw error;
    return withRetry(fn, attempts - 1);
  }
};

// Sample depot data (since we can't make real API calls)
export const sampleDepots: Depot[] = [
  {
    id: "depot_1",
    name: "KSRTC Ernakulam Depot",
    type: "main",
    address: "MG Road, Ernakulam",
    facilities: ["ticket_counter", "restroom", "canteen"],
    lat: 9.9816,
    lng: 76.2999
  },
  {
    id: "depot_2",
    name: "KSRTC Thrissur Depot",
    type: "main",
    address: "Thrissur Bus Stand",
    facilities: ["ticket_counter", "restroom"],
    lat: 10.5276,
    lng: 76.2144
  }
];

// Function to get nearby bus stops with real API call
export const getNearbyBusStops = async (
  lat: number, 
  lng: number, 
  radius: number = 50000
): Promise<BusStop[]> => {
  const cacheKey = `bus_stops_${lat.toFixed(4)}_${lng.toFixed(4)}_${radius}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;
  
  try {
    const query = `
      [out:json];
      (
        node["highway"="bus_stop"](around:${radius},${lat},${lng});
        way["highway"="bus_stop"](around:${radius},${lat},${lng});
      );
      out body;
    `;
    
    const response = await withRetry(() => 
      fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: query
      })
    );
    
    if (!response.ok) throw new Error(ERROR_MESSAGES.overpass_fail);
    const data = await response.json();
    const stops = processOverpassData(data);
    
    // Cache successful results
    setCache(cacheKey, stops);
    return stops;
  } catch (error) {
    console.error("Error fetching nearby bus stops:", error);
    
    // Fallback to sample data
    return sampleBusStops.filter(stop => {
      const distance = calculateDistance(lat, lng, stop.lat, stop.lng);
      return distance <= radius / 1000; // Convert meters to km
    });
  }
};

// Function to fetch bus routes with real API call
export const fetchBusRoutes = async (
  from: string, 
  to: string
): Promise<Bus[]> => {
  const sanitizedFrom = encodeURIComponent(from.trim());
  const sanitizedTo = encodeURIComponent(to.trim());
  const cacheKey = `bus_routes_${sanitizedFrom}_${sanitizedTo}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;
  
  try {
    const response = await withRetry(() =>
      fetch(
        `https://www.kbuses.in/v3/Find/source/${sanitizedFrom}/destination/${sanitizedTo}/type/all/timing/all`,
        {
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        }
      )
    );
    
    if (response.status === 404) return [];
    if (!response.ok) throw new Error(ERROR_MESSAGES.kbuses_fail);
    
    const data = await response.json();
    const buses = processKBusesData(data);
    
    // Cache successful results
    setCache(cacheKey, buses);
    return buses;
  } catch (error) {
    console.error("Error fetching bus routes:", error);
    
    // Fallback to sample data
    const matchingBuses = sampleBusData.filter(bus => {
      const fromMatch = bus.from.toLowerCase() === from.toLowerCase();
      const toMatch = bus.to.toLowerCase() === to.toLowerCase();
      return fromMatch && toMatch;
    });
    
    if (matchingBuses.length === 0) {
      // If no exact matches, return buses that include these stops
      return sampleBusData.filter(bus => {
        const stops = bus.stops.map(stop => stop.toLowerCase());
        const fromInStops = stops.includes(from.toLowerCase());
        const toInStops = stops.includes(to.toLowerCase());
        const fromMatchesEndpoint = bus.from.toLowerCase() === from.toLowerCase() || bus.to.toLowerCase() === from.toLowerCase();
        const toMatchesEndpoint = bus.from.toLowerCase() === to.toLowerCase() || bus.to.toLowerCase() === to.toLowerCase();
        
        return (fromInStops || fromMatchesEndpoint) && (toInStops || toMatchesEndpoint);
      });
    }
    
    return matchingBuses;
  }
};

// Function to find the nearest depot with real API call
export const findNearestDepot = async (lat: number, lng: number): Promise<Depot | null> => {
  const cacheKey = `nearest_depot_${lat.toFixed(4)}_${lng.toFixed(4)}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;
  
  try {
    const query = `
      [out:json];
      (
        node["amenity"="bus_station"]["operator"="KSRTC"](around:50000,${lat},${lng});
        node["amenity"="bus_station"]["operator"~"KSRTC",i](around:50000,${lat},${lng});
      );
      out body;
    `;
    
    const response = await withRetry(() => 
      fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: query
      })
    );
    
    if (!response.ok) throw new Error('Failed to find depot');
    
    const data = await response.json();
    
    if (data.elements.length === 0) {
      // If no real depots found, fall back to sample data
      const sortedDepots = sampleDepots
        .map(depot => ({
          ...depot,
          distance: calculateDistance(lat, lng, depot.lat, depot.lng)
        }))
        .sort((a, b) => a.distance - b.distance);
      
      if (sortedDepots.length > 0) {
        setCache(cacheKey, sortedDepots[0]);
        return sortedDepots[0];
      }
      return null;
    }
    
    // Process real depot data
    const depots = data.elements.map((item: any) => ({
      id: item.id.toString(),
      name: item.tags.name || 'KSRTC Depot',
      type: item.tags.network || 'main',
      address: item.tags.address || `${item.lat.toFixed(4)}, ${item.lon.toFixed(4)}`,
      facilities: [],
      lat: item.lat,
      lng: item.lon,
      distance: calculateDistance(lat, lng, item.lat, item.lon)
    }));
    
    const nearest = depots.sort((a: Depot, b: Depot) => a.distance! - b.distance!)[0];
    setCache(cacheKey, nearest);
    return nearest;
  } catch (error) {
    console.error("Error finding nearest depot:", error);
    
    // Fall back to sample data
    const sortedDepots = sampleDepots
      .map(depot => ({
        ...depot,
        distance: calculateDistance(lat, lng, depot.lat, depot.lng)
      }))
      .sort((a, b) => a.distance! - b.distance!);
    
    return sortedDepots[0] || null;
  }
};

// Utility function to calculate distance between coordinates (Haversine formula)
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};
