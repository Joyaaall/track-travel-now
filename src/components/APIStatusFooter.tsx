
import { useAPIStatus } from "@/utils/apiStatus";
import { RefreshCw, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

const APIStatusFooter = () => {
  const { overpassStatus, kbusesStatus, requestsThisMinute } = useAPIStatus();

  const getStatusIcon = (status: 'idle' | 'loading' | 'success' | 'error') => {
    switch (status) {
      case 'loading':
        return <Loader2 size={14} className="animate-spin" />;
      case 'success':
        return <CheckCircle size={14} className="text-green-500" />;
      case 'error':
        return <AlertTriangle size={14} className="text-red-500" />;
      default:
        return <div className="w-3.5 h-3.5 rounded-full bg-gray-300" />;
    }
  };

  return (
    <footer className="px-4 py-2 bg-white border-t border-gray-200 flex items-center justify-between text-xs text-ontrack-gray">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          {getStatusIcon(overpassStatus)}
          <span>Overpass API</span>
        </div>
        <div className="flex items-center gap-1">
          {getStatusIcon(kbusesStatus)}
          <span>KBuses API</span>
        </div>
      </div>
      <div className="flex items-center">
        <span>API Requests: {requestsThisMinute}/5 per minute</span>
      </div>
    </footer>
  );
};

export default APIStatusFooter;
