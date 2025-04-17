// Types for bus stop and bus data
export interface BusStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distance?: number;
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

export const ERROR_MESSAGES = {
  overpass_fail: 'Bus stop data unavailable. Using cached data...',
  kbuses_fail: 'Route information temporarily unavailable',
  location_fail: 'Enable location services for accurate results',
  network_fail: 'Network connection required'
};

const CACHE_EXPIRY = 60 * 60 * 1000;

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
  } catch {
    localStorage.removeItem(key);
    return null;
  }
};

const setCache = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
};

export const sampleBusData: Bus[] = [
  // ... (keep your existing sample data)
];

export const sampleBusStops: BusStop[] = [
  // ... (keep your existing sample data)
];

export const sampleDepots: Depot[] = [
  // ... (keep your existing sample data)
];

const processOverpassData = (data: any): BusStop[] => {
  if (!data?.elements) return [];
  return data.elements.map((item: any) => ({
    id: item.id?.toString() || Math.random().toString(36).substring(2, 9),
    name: item.tags?.name || 'Unnamed Stop',
    lat: item.lat || 0,
    lng: item.lon || 0
  }));
};

const processKBusesData = (data: any): Bus[] => {
  if (!Array.isArray(data)) return [];
  return data.map((bus: any) => ({
    id: bus.id || Math.floor(Math.random() * 10000),
    from: bus.source || 'Unknown',
    to: bus.destination || 'Unknown',
    type: bus.type === 'AC' ? 'AC' : bus.isExpress ? 'Express' : 'Ordinary',
    departure: bus.departureTime || '',
    arrival: bus.arrivalTime || '',
    stops: bus.intermediateStops || []
  }));
};

export const getUserLocation = (): Promise<[number, number]> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error(ERROR_MESSAGES.location_fail));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve([position.coords.latitude, position.coords.longitude]),
      (error) => {
        console.error("Location error:", error);
        resolve([9.9816, 76.2999]); // Ernakulam fallback
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
};

const withRetry = async <T>(
  fn: () => Promise<T>,
  attempts = 3,
  delay = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (attempts <= 1) throw error;
    await new Promise(res => setTimeout(res, delay));
    return withRetry(fn, attempts - 1, delay * 1.5);
  }
};

export const getNearbyBusStops = async (
  lat: number,
  lng: number,
  radius = 10000
): Promise<BusStop[]> => {
  const cacheKey = `bus_stops_${lat.toFixed(4)}_${lng.toFixed(4)}_${radius}`;
  const cached = getCache(cacheKey);
  if (cached) return cached.slice(0, 30);

  try {
    const query = `
      [out:json][timeout:30];
      (
        node["highway"="bus_stop"](around:${radius},${lat},${lng});
        way["highway"="bus_stop"](around:${radius},${lat},${lng});
      );
      out body 30;
    `;

    const response = await withRetry(() =>
      fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: query
      })
    );

    if (!response.ok) throw new Error(ERROR_MESSAGES.overpass_fail);

    const data = await response.json();
    let stops = processOverpassData(data)
      .map(stop => ({
        ...stop,
        distance: calculateDistance(lat, lng, stop.lat, stop.lng)
      }))
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))
      .slice(0, 30);

    stops = stops.map((stop, i) => ({
      ...stop,
      name: stop.name || `Bus Stop ${i + 1}`
    }));

    setCache(cacheKey, stops);
    return stops;
  } catch (error) {
    console.error("Bus stop fetch error:", error);
    return sampleBusStops
      .map(s => ({
        ...s,
        distance: calculateDistance(lat, lng, s.lat, s.lng)
      }))
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))
      .slice(0, 30);
  }
};

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
    const apiUrl = `https://www.kbuses.in/v3/Find/source/${sanitizedFrom}/destination/${sanitizedTo}/type/all/timing/all`;
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
    
    const response = await withRetry(() => fetch(proxyUrl, {
      headers: { 'Accept': 'application/json' }
    }));

    if (response.status === 404) return [];
    if (!response.ok) throw new Error(ERROR_MESSAGES.kbuses_fail);

    const data = await response.json();
    const buses = processKBusesData(data);

    if (buses.length > 0) {
      setCache(cacheKey, buses);
      return buses;
    }
    return getFallbackRoutes(from, to);
  } catch (error) {
    console.error("Route fetch error:", error);
    return getFallbackRoutes(from, to);
  }
};

const getFallbackRoutes = (from: string, to: string): Bus[] => {
  const fromLower = from.toLowerCase();
  const toLower = to.toLowerCase();
  
  return sampleBusData.filter(bus => {
    const matchesDirect = bus.from.toLowerCase() === fromLower && 
                         bus.to.toLowerCase() === toLower;
    const matchesReverse = bus.from.toLowerCase() === toLower && 
                          bus.to.toLowerCase() === fromLower;
    return matchesDirect || matchesReverse;
  });
};

export const findNearestDepot = async (
  lat: number,
  lng: number
): Promise<Depot | null> => {
  const cacheKey = `nearest_depot_${lat.toFixed(4)}_${lng.toFixed(4)}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    const query = `
      [out:json][timeout:30];
      (
        node["amenity"="bus_station"]["operator"~"KSRTC",i](around:50000,${lat},${lng});
      );
      out body;
    `;

    const response = await withRetry(() =>
      fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: query
      })
    );

    if (!response.ok) throw new Error('Depot API failed');

    const data = await response.json();
    const depots = processOverpassData(data)
      .map(d => ({
        id: d.id,
        name: d.name,
        type: 'main',
        address: '',
        facilities: [],
        lat: d.lat,
        lng: d.lng,
        distance: calculateDistance(lat, lng, d.lat, d.lng)
      }));

    if (depots.length > 0) {
      const nearest = depots.sort((a, b) => (a.distance || 0) - (b.distance || 0))[0];
      setCache(cacheKey, nearest);
      return nearest;
    }
    return getFallbackDepot(lat, lng);
  } catch (error) {
    console.error("Depot fetch error:", error);
    return getFallbackDepot(lat, lng);
  }
};

const getFallbackDepot = (lat: number, lng: number): Depot | null => {
  const withDistances = sampleDepots.map(d => ({
    ...d,
    distance: calculateDistance(lat, lng, d.lat, d.lng)
  })).sort((a, b) => (a.distance || 0) - (b.distance || 0));

  return withDistances[0] || null;
};

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return parseFloat((R * c).toFixed(3));
};
