import { useEffect, useRef, useState } from 'react';
import { Input } from './input';
import { MapPin } from 'lucide-react';

interface LocationAutocompleteProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  showMap?: boolean; // Option to show map preview
  onCoordinatesChange?: (lat: number, lng: number) => void; // Callback for coordinates
}

export default function LocationAutocomplete({
  value = '',
  onChange,
  placeholder = 'Nhập địa điểm',
  error,
  showMap = true,
  onCoordinatesChange,
}: LocationAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [inputValue, setInputValue] = useState(value);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Load Google Maps script
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
      console.warn('Google Maps API key not configured');
      return;
    }

    // Check if script is already loaded
    if (window.google?.maps?.places) {
      setIsScriptLoaded(true);
      return;
    }

    // Check if script is already in the document
    const existingScript = document.querySelector(
      `script[src*="maps.googleapis.com/maps/api/js"]`
    );
    
    if (existingScript) {
      existingScript.addEventListener('load', () => setIsScriptLoaded(true));
      return;
    }

    // Load the script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=vi&region=VN`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => {
      console.error('Failed to load Google Maps script');
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup is complex with Google Maps, so we'll leave the script loaded
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isScriptLoaded || !showMap || !mapRef.current || mapInstanceRef.current) {
      return;
    }

    try {
      // Default to Vietnam center
      const defaultCenter = { lat: 16.0544, lng: 108.2022 }; // Da Nang

      // Create map
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      // Create marker
      markerRef.current = new google.maps.Marker({
        map: mapInstanceRef.current,
        draggable: true,
        animation: google.maps.Animation.DROP,
      });

      // Add click listener to map
      mapInstanceRef.current.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          updateLocationFromLatLng(e.latLng);
        }
      });

      // Add drag listener to marker
      markerRef.current.addListener('dragend', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          updateLocationFromLatLng(e.latLng);
        }
      });
    } catch (error) {
      console.error('Error initializing Google Maps:', error);
    }
  }, [isScriptLoaded, showMap]);

  // Update location from coordinates using Geocoding
  const updateLocationFromLatLng = (latLng: google.maps.LatLng) => {
    const geocoder = new google.maps.Geocoder();
    
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const address = results[0].formatted_address;
        setInputValue(address);
        onChange(address);
        
        const coords = {
          lat: latLng.lat(),
          lng: latLng.lng(),
        };
        setSelectedCoordinates(coords);
        
        if (onCoordinatesChange) {
          onCoordinatesChange(coords.lat, coords.lng);
        }
        
        // Update marker position
        if (markerRef.current) {
          markerRef.current.setPosition(latLng);
        }
      }
    });
  };

  // Initialize autocomplete
  useEffect(() => {
    if (!isScriptLoaded || !inputRef.current || autocompleteRef.current) {
      return;
    }

    try {
      // Create autocomplete instance
      autocompleteRef.current = new google.maps.places.Autocomplete(
        inputRef.current,
        {
          componentRestrictions: { country: 'vn' }, // Restrict to Vietnam
          fields: ['formatted_address', 'name', 'geometry'],
          types: ['geocode', 'establishment'], // Allow addresses and places
        }
      );

      // Add listener for place selection
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        
        if (place) {
          const address = place.formatted_address || place.name || '';
          setInputValue(address);
          onChange(address);

          // Update coordinates and map
          if (place.geometry?.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            
            setSelectedCoordinates({ lat, lng });
            
            if (onCoordinatesChange) {
              onCoordinatesChange(lat, lng);
            }

            // Update map view
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setCenter({ lat, lng });
              mapInstanceRef.current.setZoom(16);
            }

            // Update marker
            if (markerRef.current) {
              markerRef.current.setPosition({ lat, lng });
              markerRef.current.setVisible(true);
            }
          }
        }
      });
    } catch (error) {
      console.error('Error initializing Google Maps Autocomplete:', error);
    }
  }, [isScriptLoaded, onChange, onCoordinatesChange]);

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="pl-10"
        />
      </div>
      
      {error && <p className="text-sm text-red-500">{error}</p>}
      
      {!isScriptLoaded && (
        <p className="text-xs text-muted-foreground">
          {import.meta.env.VITE_GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY'
            ? 'Chưa cấu hình Google Maps API key'
            : 'Đang tải bản đồ...'}
        </p>
      )}

      {/* Map Preview */}
      {showMap && isScriptLoaded && (
        <div className="space-y-2">
          <div 
            ref={mapRef} 
            className="w-full h-[300px] rounded-lg border border-border"
          />
          {selectedCoordinates && (
            <p className="text-xs text-muted-foreground">
              Tọa độ: {selectedCoordinates.lat.toFixed(6)}, {selectedCoordinates.lng.toFixed(6)}
              {' '} • Click trên bản đồ hoặc kéo marker để chọn vị trí chính xác
            </p>
          )}
        </div>
      )}
    </div>
  );
}
