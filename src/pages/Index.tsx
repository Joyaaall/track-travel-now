import { useEffect, useState } from "react";
import SearchBar from "@/components/SearchBar";
import BusMap from "@/components/BusMap";
import BusList from "@/components/BusList";
import ErrorBoundary from "@/components/ErrorBoundary";
import APIStatusFooter from "@/components/APIStatusFooter";
import { Bus, BusStop, getNearbyBusStops, getUserLocation, fetchBusRoutes, Depot, calculateDistance, ERROR_MESSAGES } from "@/utils/api";
import { MapPin, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { findNearestDepot } from "@/utils/api";
import DepotPanel from "@/components/DepotPanel";
import { useAPIStatus } from "@/utils/apiStatus";

const Index = () => {
  const [userLocation, setUserLocation] = useState<[number, number]>([10.0261, 76.3125]);
  const [busStops, setBusStops] = useState<BusStop[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [selectedDepot, setSelectedDepot] = useState<Depot | null>(null);
  const [loading, setLoading] = useState({
    location: true,
    busStops: false,
    buses: false
  });
  const [error, setError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  
  const { setOverpassStatus, setKBusesStatus, incrementRequestCount } = useAPIStatus();

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const location = await getUserLocation();
        setUserLocation(location);
        fetchNearbyBusStops(location);
      } catch (err) {
        setError(ERROR_MESSAGES.location_fail);
        toast.error("Location access denied", {
          description: "Please enable location services for a better experience"
        });
      } finally {
        setLoading(prev => ({ ...prev, location: false }));
      }
    };

    fetchLocation();
  }, []);

  const fetchNearbyBusStops = async (location: [number, number]) => {
    setLoading(prev => ({ ...prev, busStops: true }));
    setOverpassStatus('loading');
    
    try {
      if (!incrementRequestCount()) {
        toast.warning("Rate limit reached", { 
          description: "Please wait a moment before trying again" 
        });
        throw new Error("Rate limit reached");
      }
      
      const stops = await getNearbyBusStops(location[0], location[1]);
      setBusStops(stops);
      setOverpassStatus('success');
      
      if (stops.length > 0) {
        toast.info(`Found ${stops.length} bus stops nearby`, {
          icon: <MapPin size={18} />
        });
      }
    } catch (err) {
      setOverpassStatus('error');
      setError(ERROR_MESSAGES.overpass_fail);
      toast.error("Error fetching bus stops", {
        description: "Using cached data instead",
        action: {
          label: "Retry",
          onClick: () => fetchNearbyBusStops(location)
        }
      });
    } finally {
      setLoading(prev => ({ ...prev, busStops: false }));
    }
  };

  const handleSearch = async (from: string, to: string) => {
    setLoading(prev => ({ ...prev, buses: true }));
    setSearchPerformed(true);
    setSelectedBus(null);
    setKBusesStatus('loading');
    
    try {
      if (!incrementRequestCount()) {
        toast.warning("Rate limit reached", { 
          description: "Please wait a moment before trying again" 
        });
        throw new Error("Rate limit reached");
      }
      
      const busRoutes = await fetchBusRoutes(from, to);
      setBuses(busRoutes);
      setKBusesStatus('success');
      
      if (busRoutes.length === 0) {
        toast.warning("No buses found for this route", {
          description: "Try different locations or times"
        });
      }
    } catch (err) {
      setKBusesStatus('error');
      setError(ERROR_MESSAGES.kbuses_fail);
      toast.error("Search failed", {
        description: "Could not find bus routes. Please try again.",
        action: {
          label: "Retry",
          onClick: () => handleSearch(from, to)
        }
      });
    } finally {
      setLoading(prev => ({ ...prev, buses: false }));
    }
  };

  const handleBusStopClick = (busStop: BusStop) => {
    toast(`${busStop.name}`, {
      description: "Click for more information",
      action: {
        label: "View Departures",
        onClick: () => toast.info("Feature coming soon!")
      }
    });
  };

  const handleViewRoute = async (bus: Bus) => {
    setSelectedBus(bus === selectedBus ? null : bus);
    
    if (bus !== selectedBus) {
      try {
        const firstStop = busStops.find(stop => stop.name === bus.stops[0]);
        if (firstStop) {
          setOverpassStatus('loading');
          const depot = await findNearestDepot(firstStop.lat, firstStop.lng);
          setOverpassStatus('success');
          if (depot) {
            setSelectedDepot(depot);
          }
        }
      } catch (error) {
        setOverpassStatus('error');
        console.error("Error finding depot:", error);
        toast.error("Could not find nearest depot", {
          action: {
            label: "Retry",
            onClick: () => handleViewRoute(bus)
          }
        });
      }
    } else {
      setSelectedDepot(null);
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-screen">
        <header className="px-4 py-2 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="font-bold text-2xl text-ontrack-blue">OnTrack</div>
              <div className="text-xs bg-ontrack-blue text-white px-2 py-0.5 rounded-md ml-2 font-medium">
                BETA
              </div>
            </div>
            
            {error && (
              <div className="flex items-center text-red-500 text-sm">
                <AlertCircle size={16} className="mr-1" />
                <span className="hidden md:inline">{error}</span>
              </div>
            )}
          </div>
        </header>
        
        <SearchBar onSearch={handleSearch} />
        
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
          <div className={`${selectedBus ? 'h-1/3' : 'h-1/2'} md:h-auto md:w-1/2 lg:w-3/5`}>
            <BusMap
              center={userLocation}
              busStops={busStops}
              depot={selectedDepot}
              onBusStopClick={handleBusStopClick}
            />
          </div>
          
          <div className={`${selectedBus ? 'h-2/3' : 'h-1/2'} md:h-auto md:w-1/2 lg:w-2/5 bg-ontrack-gray-light overflow-hidden`}>
            {!searchPerformed && !loading.buses ? (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center text-ontrack-gray">
                <div className="mb-4 text-5xl">🚌</div>
                <h3 className="text-lg font-medium mb-1">Search for Buses</h3>
                <p className="text-sm max-w-xs">
                  Enter your starting point and destination to find available buses
                </p>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                <BusList
                  buses={buses}
                  loading={loading.buses}
                  onViewRoute={handleViewRoute}
                />
                
                {selectedDepot && (
                  <div className="p-4 border-t border-gray-200">
                    <DepotPanel
                      depot={selectedDepot}
                      distance={calculateDistance(userLocation[0], userLocation[1], selectedDepot.lat, selectedDepot.lng)}
                      onClose={() => setSelectedDepot(null)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
        
        {selectedBus && (
          <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg rounded-t-xl animate-fade-in transform transition-transform duration-300 z-20">
            <h3 className="font-bold text-lg">{selectedBus.from} → {selectedBus.to}</h3>
            <div className="flex justify-between text-sm text-ontrack-gray mt-1">
              <div>Departure: {selectedBus.departure}</div>
              <div>Arrival: {selectedBus.arrival}</div>
            </div>
            <div className="mt-3">
              <div className="text-sm font-medium">Route:</div>
              <div className="flex overflow-x-auto pt-2 pb-1 gap-2">
                {selectedBus.stops.map((stop, index) => (
                  <div key={index} className="flex items-center flex-shrink-0">
                    <div className="w-2 h-2 bg-ontrack-blue rounded-full"></div>
                    <div className="mx-1 text-xs">{index === 0 || index === selectedBus.stops.length - 1 ? "" : "—"}</div>
                    <div className="text-xs whitespace-nowrap px-2 py-1 bg-ontrack-gray-light rounded-md">
                      {stop}
                    </div>
                    <div className="mx-1 text-xs">{index === selectedBus.stops.length - 1 ? "" : "—"}</div>
                  </div>
                ))}
              </div>
            </div>
            <button 
              onClick={() => setSelectedBus(null)}
              className="mt-3 w-full py-2 text-sm bg-ontrack-gray-light rounded-md hover:bg-gray-200 transition-colors"
            >
              Close Details
            </button>
          </div>
        )}
        
        <APIStatusFooter />
      </div>
    </ErrorBoundary>
  );
};

export default Index;
