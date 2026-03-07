import { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Input } from "./input";
import { Button } from "./button";
import { LocateFixed, MapPin, Search } from "lucide-react";

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LocationPickerProps {
  value?: string;
  onChange?: (address: string) => void;
  onCoordinatesChange?: (lat: number, lng: number) => void;
  placeholder?: string;
  error?: string;
  showMap?: boolean;
  mapFirst?: boolean;
}

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

// Component để xử lý click event trên map
function MapClickHandler({
  onClick,
}: {
  onClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (e) => {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component để fly đến vị trí được chọn
function FlyToLocation({ position }: { position: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(position, 15, {
      duration: 1.5,
    });
  }, [map, position]);

  return null;
}

export default function OSMLocationPicker({
  value = "",
  onChange,
  onCoordinatesChange,
  placeholder = "Nhập địa chỉ hoặc click trên bản đồ",
  error,
  showMap = true,
  mapFirst = false,
}: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState(value);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingCurrentLocation, setIsGettingCurrentLocation] =
    useState(false);
  const [geoError, setGeoError] = useState("");
  const [position, setPosition] = useState<[number, number]>([
    10.0335, 105.7897,
  ]); // Can Tho default
  const searchTimeoutRef = useRef<number>();

  useEffect(() => {
    setSearchQuery(value);
    // Auto-geocode when value changes (e.g., when editing an event)
    if (value && value.trim()) {
      geocodeAddress(value);
    }
  }, [value]);

  // Forward geocoding: địa chỉ -> tọa độ
  const geocodeAddress = async (address: string) => {
    if (!address || address.length < 3) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "vi",
          },
        },
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setPosition([lat, lng]);
        onCoordinatesChange?.(lat, lng);
      }
    } catch (error) {
      console.error("Error geocoding address:", error);
    }
  };

  // Search địa chỉ với Nominatim
  const searchAddress = async (query: string) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "vi",
          },
        },
      );
      const data = await response.json();
      setSearchResults(data);
      setShowResults(true);
    } catch (error) {
      console.error("Error searching address:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Reverse geocoding: tọa độ -> địa chỉ
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "vi",
          },
        },
      );
      const data = await response.json();
      if (data.display_name) {
        setSearchQuery(data.display_name);
        onChange?.(data.display_name);
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchAddress(query);
    }, 500);
  };

  const handleSelectResult = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setPosition([lat, lng]);
    setSearchQuery(result.display_name);
    setShowResults(false);
    onChange?.(result.display_name);
    onCoordinatesChange?.(lat, lng);
  };

  const handleMapClick = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onCoordinatesChange?.(lat, lng);
    reverseGeocode(lat, lng);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Trinh duyet khong ho tro dinh vi.");
      return;
    }

    setGeoError("");
    setIsGettingCurrentLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (positionData) => {
        const lat = positionData.coords.latitude;
        const lng = positionData.coords.longitude;
        setPosition([lat, lng]);
        onCoordinatesChange?.(lat, lng);
        await reverseGeocode(lat, lng);
        setIsGettingCurrentLocation(false);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoError("Ban can cap quyen vi tri de lay dia chi hien tai.");
            break;
          case error.POSITION_UNAVAILABLE:
            setGeoError("Khong lay duoc vi tri hien tai. Vui long thu lai.");
            break;
          case error.TIMEOUT:
            setGeoError("Het thoi gian lay vi tri. Vui long thu lai.");
            break;
          default:
            setGeoError("Co loi khi lay vi tri hien tai.");
        }
        setIsGettingCurrentLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  };

  const searchInput = (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-xl border-red-300 text-red-700 hover:bg-red-50"
          disabled={isGettingCurrentLocation}
          onClick={handleGetCurrentLocation}
        >
          <LocateFixed className="mr-2 h-4 w-4" />
          {isGettingCurrentLocation
            ? "Dang lay vi tri..."
            : "Lay vi tri hien tai"}
        </Button>
      </div>

      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={placeholder}
            className={`h-11 w-full rounded-xl border-[1px] border-red-400 pl-10 pr-3 text-base focus:ring-0 focus:outline-red-500 focus-visible:ring-0 focus-visible:ring-offset-0 ${error || geoError ? "border-red-500" : ""}`}
            onFocus={() => {
              if (searchResults.length > 0) {
                setShowResults(true);
              }
            }}
          />
        </div>

        {showResults && searchResults.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
            {searchResults.map((result) => (
              <button
                key={result.place_id}
                type="button"
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-start gap-2 border-b last:border-b-0"
                onClick={() => handleSelectResult(result)}
              >
                <MapPin className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                <span className="text-sm">{result.display_name}</span>
              </button>
            ))}
          </div>
        )}

        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );

  const mapBlock = showMap ? (
    <div className="space-y-2">
      <div className="h-[400px] rounded-md overflow-hidden border border-red-200">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={position}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const newPos = marker.getLatLng();
                setPosition([newPos.lat, newPos.lng]);
                onCoordinatesChange?.(newPos.lat, newPos.lng);
                reverseGeocode(newPos.lat, newPos.lng);
              },
            }}
          />
          <MapClickHandler onClick={handleMapClick} />
          <FlyToLocation position={position} />
        </MapContainer>
      </div>

      <div className="flex gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          <span>
            Lat: {position[0].toFixed(6)}, Lng: {position[1].toFixed(6)}
          </span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Click tren ban do hoac keo marker de chon vi tri chinh xac
      </p>
    </div>
  ) : null;

  return (
    <div className="space-y-2">
      {mapFirst ? mapBlock : null}
      {searchInput}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {geoError && <p className="text-sm text-red-500">{geoError}</p>}
      {!mapFirst ? mapBlock : null}
    </div>
  );
}
