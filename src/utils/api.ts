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
  radius = 2000 // Changed to 2km radius
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
      .filter(s => (s.distance || Infinity) <= 2) // Filter within 2km
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

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Extract data from HTML tables
    const rows = Array.from(doc.querySelectorAll('table tr')).slice(1); // Skip header
    const buses = rows.map(row => {
      const cells = Array.from(row.querySelectorAll('td'));
      return {
        id: parseInt(cells[0]?.textContent?.trim() || '0') || Math.floor(Math.random() * 10000),
        from,
        to,
        type: cells[2]?.textContent?.trim()?.includes('AC') ? 'AC' : 'Ordinary',
        departure: cells[3]?.textContent?.trim() || '',
        arrival: cells[4]?.textContent?.trim() || '',
        stops: []
      };
    }).filter(bus => bus.id && bus.departure && bus.arrival);

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
  lng: number,
  radius = 2000 // Changed to 2km radius
): Promise<Depot | null> => {
  const cacheKey = `nearest_depot_${lat.toFixed(4)}_${lng.toFixed(4)}_${radius}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    const query = `
      [out:json][timeout:30];
      (
        node["amenity"="bus_station"]["operator"~"KSRTC",i](around:${radius},${lat},${lng});
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
      }))
      .filter(d => (d.distance || Infinity) <= 2); // Filter within 2km

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
  }))
  .filter(d => (d.distance || Infinity) <= 2) // Filter within 2km
  .sort((a, b) => (a.distance || 0) - (b.distance || 0));

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
