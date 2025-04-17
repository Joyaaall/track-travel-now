import { Bus } from "@/utils/api";
import { useState } from "react";
import { AlertCircle, Clock, IndianRupee } from "lucide-react";
import { toast } from "sonner";

interface BusCardProps {
  bus: Bus;
  onViewRoute?: (bus: Bus) => void;
}

const BusCard = ({ bus, onViewRoute }: BusCardProps) => {
  const [alertSet, setAlertSet] = useState(false);

  const handleSetAlert = () => {
    setAlertSet(!alertSet);
    if (!alertSet) {
      toast.success(`Alert set for ${bus.from} to ${bus.to} bus at ${bus.departure}`);
    } else {
      toast.info(`Alert removed for ${bus.from} to ${bus.to} bus`);
    }
  };
  
  const getBusTypeIcon = (type: string) => {
    switch (type) {
      case "AC":
        return "❄️";
      case "Express":
        return "⚡";
      case "Ordinary":
        return "🛣️";
      default:
        return "🚌";
    }
  };
  
  return (
    <div className="bus-card my-2 animate-fade-in p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div className="bus-header flex items-center gap-2">
          <span className="text-ontrack-blue text-lg">
            {getBusTypeIcon(bus.type)}
          </span>
          <span className={`bus-type ${bus.type.toLowerCase()} px-2 py-1 rounded-full text-xs font-medium`}>
            {bus.type} Bus
          </span>
        </div>
        {bus.busNumber && (
          <span className="text-sm bg-gray-100 px-2 py-1 rounded">
            {bus.busNumber}
          </span>
        )}
      </div>
      
      <div className="text-lg font-medium text-ontrack-gray-dark mb-1">
        {bus.from} → {bus.to}
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm text-ontrack-gray mb-3">
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span>Depart: {bus.departure}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span>Arrive: {bus.arrival}</span>
        </div>
        {bus.duration && (
          <div className="col-span-2 flex items-center gap-1 text-xs bg-blue-50 px-2 py-1 rounded">
            <span>⏱️ Duration: {bus.duration}</span>
          </div>
        )}
        {bus.fare && (
          <div className="col-span-2 flex items-center gap-1 text-xs bg-green-50 px-2 py-1 rounded">
            <IndianRupee size={12} />
            <span>Fare: ₹{bus.fare}</span>
          </div>
        )}
      </div>
      
      <div className="mt-3 flex gap-2">
        <button
          onClick={handleSetAlert}
          className={`alert-btn flex-1 py-1.5 text-sm rounded-md ${
            alertSet 
              ? "bg-ontrack-blue text-white hover:bg-ontrack-blue-dark" 
              : "bg-ontrack-gray-light text-ontrack-gray-dark hover:bg-ontrack-gray-light/70"
          } transition-colors flex items-center justify-center gap-1`}
        >
          <AlertCircle size={16} />
          {alertSet ? "Alert Set" : "Set Alert"}
        </button>
        
        {onViewRoute && (
          <button 
            onClick={() => onViewRoute(bus)} 
            className="flex-1 py-1.5 text-sm rounded-md bg-ontrack-gray-light text-ontrack-gray-dark hover:bg-ontrack-gray-light/70 transition-colors"
          >
            View Route
          </button>
        )}
      </div>
      
      {bus.stops && bus.stops.length > 0 && (
        <div className="mt-3 pt-3 border-t border-dashed border-gray-200">
          <details className="group">
            <summary className="flex justify-between items-center text-xs text-ontrack-gray cursor-pointer">
              <span className="font-medium">Show Stops ({bus.stops.length})</span>
              <span className="transition-transform group-open:rotate-180">▼</span>
            </summary>
            <div className="mt-2 text-xs text-ontrack-gray">
              {bus.stops.join(" → ")}
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default BusCard;
