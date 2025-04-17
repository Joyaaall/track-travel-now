
import { Bus } from "@/utils/api";
import { useState } from "react";
import { AlertCircle, Clock } from "lucide-react";
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
    <div className="bus-card my-2 animate-fade-in">
      <div className="bus-header">
        <span className="text-ontrack-blue text-lg">
          {getBusTypeIcon(bus.type)}
        </span>
        <span className={`bus-type ${bus.type.toLowerCase()}`}>
          {bus.type} Bus
        </span>
      </div>
      
      <div className="text-lg font-medium text-ontrack-gray-dark">
        {bus.from} → {bus.to}
      </div>
      
      <div className="mt-2 flex items-center justify-between text-sm text-ontrack-gray">
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span>Depart: {bus.departure}</span>
        </div>
        <div>Arrive: {bus.arrival}</div>
      </div>
      
      <div className="mt-3 flex gap-2">
        <button
          onClick={handleSetAlert}
          className={`alert-btn flex-1 ${
            alertSet ? "bg-ontrack-blue text-white hover:bg-ontrack-blue-dark" : ""
          }`}
        >
          <div className="flex items-center justify-center gap-1">
            <AlertCircle size={16} />
            {alertSet ? "Alert Set" : "Set Alert"}
          </div>
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
        <div className="mt-2 pt-2 border-t border-dashed border-gray-200">
          <div className="text-xs text-ontrack-gray">
            <span className="font-medium">Stops:</span> {bus.stops.join(" • ")}
          </div>
        </div>
      )}
    </div>
  );
};

export default BusCard;
