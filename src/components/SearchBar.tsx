
import { Search } from "lucide-react";
import { useState } from "react";

interface SearchBarProps {
  onSearch: (from: string, to: string) => void;
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeInput, setActiveInput] = useState<"from" | "to" | null>(null);
  
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
  
  const handleInputChange = (
    value: string, 
    type: "from" | "to"
  ) => {
    if (type === "from") {
      setFrom(value);
    } else {
      setTo(value);
    }
    
    if (value.length > 1) {
      const filtered = mockSuggestions.filter(place => 
        place.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (from && to) {
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
            className="search-input"
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
            className="search-input"
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
        
        <button type="submit" className="search-btn">
          <Search size={20} />
          <span>Search Buses</span>
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
