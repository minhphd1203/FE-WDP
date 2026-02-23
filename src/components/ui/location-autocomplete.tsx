import { useEffect, useRef, useState } from 'react';
import { Input } from './input';
import { MapPin } from 'lucide-react';

interface LocationAutocompleteProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export default function LocationAutocomplete({
  value = '',
  onChange,
  placeholder = 'Nhập địa điểm',
  error,
}: LocationAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState(value);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

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
        }
      });
    } catch (error) {
      console.error('Error initializing Google Maps Autocomplete:', error);
    }
  }, [isScriptLoaded, onChange]);

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
    <div className="relative">
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
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      {!isScriptLoaded && (
        <p className="text-xs text-muted-foreground mt-1">
          {import.meta.env.VITE_GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY'
            ? 'Chưa cấu hình Google Maps API key'
            : 'Đang tải bản đồ...'}
        </p>
      )}
    </div>
  );
}
