
import { Bus } from "@/utils/api";
import BusCard from "./BusCard";
import { Bus as BusIcon } from "lucide-react";

interface BusListProps {
  buses: Bus[];
  loading?: boolean;
  onViewRoute?: (bus: Bus) => void;
}

const BusList = ({ buses, loading = false, onViewRoute }: BusListProps) => {
  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="flex justify-between mb-3">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (buses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-ontrack-gray">
        <BusIcon size={48} className="mb-2 opacity-30" />
        <h3 className="text-lg font-medium">No buses found</h3>
        <p className="text-sm">Try different locations or check back later</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]">
      <h2 className="font-medium text-lg text-ontrack-gray-dark mb-2">
        Available Buses ({buses.length})
      </h2>
      
      {buses.map((bus) => (
        <BusCard key={bus.id} bus={bus} onViewRoute={onViewRoute} />
      ))}
    </div>
  );
};

export default BusList;
