
import { Depot } from "@/utils/api";
import { Building, Navigation } from "lucide-react";

interface DepotPanelProps {
  depot: Depot;
  distance: number;
  onClose: () => void;
}

const DepotPanel = ({ depot, distance, onClose }: DepotPanelProps) => {
  return (
    <div className="depot-panel bg-white p-4 rounded-lg shadow-lg animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Nearest KSRTC Depot</h3>
        <button onClick={onClose} className="text-ontrack-gray hover:text-black">&times;</button>
      </div>
      
      <div className="flex items-start gap-3 mb-4">
        <Building className="text-ontrack-blue mt-1" />
        <div>
          <p className="font-medium">{depot.name}</p>
          <p className="text-sm text-ontrack-gray">{distance.toFixed(1)} km away</p>
          <p className="text-sm text-ontrack-gray">{depot.address}</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Available Facilities</h4>
        <div className="flex flex-wrap gap-2">
          {depot.facilities.map((facility) => (
            <span 
              key={facility}
              className="text-xs px-2 py-1 bg-ontrack-gray-light rounded-full"
            >
              {facility.replace("_", " ")}
            </span>
          ))}
        </div>
      </div>
      
      <button 
        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${depot.lat},${depot.lng}`, '_blank')}
        className="mt-4 w-full flex items-center justify-center gap-2 bg-ontrack-blue text-white py-2 px-4 rounded-md hover:bg-ontrack-blue-dark transition-colors"
      >
        <Navigation size={16} />
        Get Directions
      </button>
    </div>
  );
};

export default DepotPanel;
