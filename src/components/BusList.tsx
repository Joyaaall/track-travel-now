import { Bus } from "@/utils/api";
import BusCard from "./BusCard";
import { Bus as BusIcon, Clock } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

interface BusListProps {
  buses: Bus[];
  loading?: boolean;
  onViewRoute?: (bus: Bus) => void;
  lastUpdated?: string;
}

const BusList = ({ buses, loading = false, onViewRoute, lastUpdated }: BusListProps) => {
  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between mb-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-6 w-full mb-3" />
            <div className="flex gap-4 mb-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 flex-1" />
            </div>
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
    <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-200px)]">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-medium text-lg text-ontrack-gray-dark">
          Available Buses ({buses.length})
        </h2>
        {lastUpdated && (
          <div className="flex items-center text-xs text-ontrack-gray">
            <Clock className="mr-1 h-3 w-3" />
            Updated: {lastUpdated}
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        {buses.map((bus) => (
          <BusCard 
            key={`${bus.id}-${bus.departure}`} 
            bus={bus} 
            onViewRoute={onViewRoute} 
          />
        ))}
      </div>

      <div className="pt-2 mt-4 text-xs text-ontrack-gray text-center">
        {buses.some(b => b.fare) ? (
          <p>Fares shown are approximate and subject to change</p>
        ) : (
          <p>Tap "View Route" to see detailed stops</p>
        )}
      </div>
    </div>
  );
};

export default BusList;
