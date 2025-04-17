
import { create } from 'zustand';

type APIStatus = 'idle' | 'loading' | 'success' | 'error';

interface APIStatusStore {
  overpassStatus: APIStatus;
  kbusesStatus: APIStatus;
  requestsThisMinute: number;
  lastRequestReset: number;
  setOverpassStatus: (status: APIStatus) => void;
  setKBusesStatus: (status: APIStatus) => void;
  incrementRequestCount: () => boolean; // Returns true if under rate limit, false otherwise
}

export const useAPIStatus = create<APIStatusStore>((set, get) => ({
  overpassStatus: 'idle',
  kbusesStatus: 'idle',
  requestsThisMinute: 0,
  lastRequestReset: Date.now(),
  
  setOverpassStatus: (status) => set({ overpassStatus: status }),
  setKBusesStatus: (status) => set({ kbusesStatus: status }),
  
  incrementRequestCount: () => {
    const now = Date.now();
    const { requestsThisMinute, lastRequestReset } = get();
    
    // Reset counter if a minute has passed
    if (now - lastRequestReset > 60000) {
      set({ requestsThisMinute: 1, lastRequestReset: now });
      return true;
    }
    
    // Check if we're over the rate limit
    if (requestsThisMinute >= 5) {
      return false;
    }
    
    // Increment the counter
    set({ requestsThisMinute: requestsThisMinute + 1 });
    return true;
  }
}));
