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

// Function to get user's current location
export const getUserLocation = (): Promise<[number, number]> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
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

// Function to get nearby bus stops (mocks the Overpass API call)
export const getNearbyBusStops = async (
  lat: number, 
  lng: number, 
  radius: number = 50000 // Changed from 2000 to 50000
): Promise<BusStop[]> => {
  try {
    // In a real app, this would be an API call to Overpass
    // const query = `[out:json];(node["highway"="bus_stop"](around:${radius},${lat},${lng}););out;`;
    // const response = await fetch('https://overpass-api.de/api/interpreter', {
    //   method: 'POST',
    //   body: query
    // });
    // const data = await response.json();
    
    // For now, we'll filter our sample data based on a simple distance calculation
    const nearbyStops = sampleBusStops.filter(stop => {
      const distance = calculateDistance(lat, lng, stop.lat, stop.lng);
      return distance <= radius / 1000; // Convert meters to km
    });
    
    return nearbyStops;
  } catch (error) {
    console.error("Error fetching nearby bus stops:", error);
    return [];
  }
};

// Function to fetch bus routes (mocks KBuses.in API call)
export const fetchBusRoutes = async (
  from: string, 
  to: string
): Promise<Bus[]> => {
  try {
    // In a real app, this would be an API call
    // const response = await fetch(
    //   `https://www.kbuses.in/v3/Find/source/${from}/destination/${to}/type/all/timing/all`
    // );
    // const data = await response.json();
    
    // Filter our sample data based on from and to locations
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
  } catch (error) {
    console.error("Error fetching bus routes:", error);
    return [];
  }
};

// Function to find the nearest depot
export const findNearestDepot = async (lat: number, lng: number): Promise<Depot | null> => {
  try {
    // In a real app, this would be an Overpass API call
    // const query = `[out:json];(node["amenity"="bus_station"]["operator"="KSRTC"](around:50000,${lat},${lng}););out body;`;
    
    // For now, find the nearest depot from our sample data
    const sortedDepots = sampleDepots
      .map(depot => ({
        ...depot,
        distance: calculateDistance(lat, lng, depot.lat, depot.lng)
      }))
      .sort((a, b) => a.distance - b.distance);
    
    return sortedDepots[0] || null;
  } catch (error) {
    console.error("Error finding nearest depot:", error);
    return null;
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
