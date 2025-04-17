import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import debounce from "lodash.debounce";

interface SearchBarProps {
  onSearch: (from: string, to: string) => void;
}

interface LocationSuggestion {
  name: string;
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeInput, setActiveInput] = useState<"from" | "to" | null>(null);
  const [cachedSuggestions, setCachedSuggestions] = useState<Record<string, string[]>>({});
  
  const mockSuggestions = [
    "Ernakulam",
    "Kozhikode",
    "Thrissur",
    "Kottayam",
    "Kollam",
    "Thiruvananthapuram",
    "Alappuzha",
    "Palakkad",
    "Kannur",
    "Malappuram",
  ];
  
  const debouncedFetchSuggestions = debounce((value: string, type: "from" | "to") => {
    if (value.length >= 3) {
      const filtered = mockSuggestions.filter(place => 
        place.toLowerCase().includes(value.toLowerCase())
      );
      
      setCachedSuggestions(prev => ({
        ...prev,
        [value.toLowerCase()]: filtered
      }));
      
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, 300);
  
  useEffect(() => {
    return () => {
      debouncedFetchSuggestions.cancel();
    };
  }, []);
  
  const handleInputChange = (
    value: string, 
    type: "from" | "to"
  ) => {
    if (type === "from") {
      setFrom(value);
    } else {
      setTo(value);
    }
    
    const cachedResult = cachedSuggestions[value.toLowerCase()];
    if (value.length >= 3 && cachedResult) {
      setSuggestions(cachedResult);
    } else {
      debouncedFetchSuggestions(value, type);
    }
  };
  
  const handleSelectSuggestion = (value: string) => {
    if (activeInput === "from") {
      setFrom(value);
    } else if (activeInput === "to") {
      setTo(value);
    }
    setSuggestions([]);
    setActiveInput(null);
  };
  
  const validateSearch = (from: string, to: string): boolean => {
    if (from.length < 3 || to.length < 3) {
      toast.error("Please enter at least 3 characters for both locations");
      return false;
    }
    
    if (from.toLowerCase() === to.toLowerCase()) {
      toast.error("From and To locations cannot be the same");
      return false;
    }
    
    if (!mockSuggestions.some(place => place.toLowerCase() === from.toLowerCase())) {
      toast.error("Please select a valid 'From' location from the suggestions");
      return false;
    }
    
    if (!mockSuggestions.some(place => place.toLowerCase() === to.toLowerCase())) {
      toast.error("Please select a valid 'To' location from the suggestions");
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateSearch(from, to)) {
      onSearch(from, to);
      setSuggestions([]);
    }
  };
  
  return (
    <div className="search-section w-full px-4 pt-4 pb-2 bg-white shadow-sm z-10 relative">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="From..."
            className="search-input w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-ontrack-blue focus:border-transparent"
            value={from}
            onChange={(e) => handleInputChange(e.target.value, "from")}
            onFocus={() => setActiveInput("from")}
          />
          {activeInput === "from" && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white rounded-md shadow-md mt-1 z-50 max-h-60 overflow-y-auto">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelectSuggestion(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="To..."
            className="search-input w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-ontrack-blue focus:border-transparent"
            value={to}
            onChange={(e) => handleInputChange(e.target.value, "to")}
            onFocus={() => setActiveInput("to")}
          />
          {activeInput === "to" && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white rounded-md shadow-md mt-1 z-50 max-h-60 overflow-y-auto">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelectSuggestion(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <button type="submit" className="search-btn bg-ontrack-blue text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
          <Search size={20} />
          <span>Search Buses</span>
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
