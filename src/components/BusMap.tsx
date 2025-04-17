
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet";
import { BusStop } from "@/utils/api";
import "leaflet/dist/leaflet.css";
import { icon } from "leaflet";
import { Map } from "lucide-react";

// Fix for default marker icon in react-leaflet
const defaultIcon = icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom icon for bus stops
const busStopIcon = icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [20, 33],
  iconAnchor: [10, 33],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: "bus-stop-icon"
});

// Component that updates the map view when center changes
const ChangeView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
};

interface BusMapProps {
  center: [number, number];
  busStops: BusStop[];
  onBusStopClick?: (busStop: BusStop) => void;
}

const BusMap = ({ center, busStops, onBusStopClick }: BusMapProps) => {
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    setMapLoaded(true);
  }, []);

  // Set attribution for OSM
  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  
  if (!mapLoaded) {
    return (
      <div className="flex items-center justify-center h-full bg-ontrack-gray-light">
        <div className="flex flex-col items-center text-ontrack-gray animate-pulse-slow">
          <Map size={24} className="mb-2" />
          <span>Loading map...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center}
        zoom={15}
        className="h-full w-full"
        zoomControl={false}
      >
        <ChangeView center={center} />
        
        <TileLayer
          attribution={attribution}
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User location marker */}
        <Marker position={center} icon={defaultIcon}>
          <Popup>
            <div className="text-center">
              <strong>Your Location</strong>
              <div className="text-xs text-ontrack-gray">
                {center[0].toFixed(4)}, {center[1].toFixed(4)}
              </div>
            </div>
          </Popup>
        </Marker>
        
        {/* 2km radius circle around user */}
        <Circle
          center={center}
          radius={2000}
          pathOptions={{ fillColor: '#0EA5E9', fillOpacity: 0.1, weight: 1, color: '#0EA5E9' }}
        />
        
        {/* Bus stop markers */}
        {busStops.map((stop) => (
          <Marker
            key={stop.id}
            position={[stop.lat, stop.lng]}
            icon={busStopIcon}
            eventHandlers={{
              click: () => onBusStopClick && onBusStopClick(stop),
            }}
          >
            <Popup>
              <div className="text-center">
                <strong>{stop.name}</strong>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default BusMap;
