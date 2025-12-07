import { useCallback, useRef, useState, useEffect } from 'react';
import Map, { Marker, MapRef } from 'react-map-gl';
import { MapPin, Crosshair } from 'lucide-react';
import { MAPBOX_TOKEN, MAP_STYLE } from '../../lib/mapbox';
import { cn } from '../../lib/utils';
import { Button } from '../ui';

interface MiniMapProps {
  latitude: number;
  longitude: number;
  onLocationChange?: (lat: number, lng: number) => void;
  editable?: boolean;
  className?: string;
}

export default function MiniMap({
  latitude,
  longitude,
  onLocationChange,
  editable = false,
  className,
}: MiniMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [markerPosition, setMarkerPosition] = useState({ lat: latitude, lng: longitude });
  const [mapError, setMapError] = useState<string | null>(null);

  // Update marker when props change
  useEffect(() => {
    setMarkerPosition({ lat: latitude, lng: longitude });
  }, [latitude, longitude]);

  // Check for valid token
  const isValidToken = MAPBOX_TOKEN && MAPBOX_TOKEN.length > 50 && MAPBOX_TOKEN.startsWith('pk.');

  if (!isValidToken) {
    return (
      <div className={cn('relative rounded-xl overflow-hidden bg-dark-800 flex items-center justify-center w-full h-full', className)}>
        <div className="text-center p-4">
          <p className="text-dark-400 text-sm">Map not available</p>
          <p className="text-dark-500 text-xs mt-1">Mapbox token required</p>
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className={cn('relative rounded-xl overflow-hidden bg-dark-800 flex items-center justify-center w-full h-full', className)}>
        <div className="text-center p-4">
          <p className="text-dark-400 text-sm">Error loading map</p>
          <button
            onClick={() => setMapError(null)}
            className="text-primary-400 text-xs mt-1 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Handle map click to move marker
  const handleMapClick = useCallback(
    (event: { lngLat: { lat: number; lng: number } }) => {
      if (!editable) return;
      
      const { lat, lng } = event.lngLat;
      setMarkerPosition({ lat, lng });
      onLocationChange?.(lat, lng);
    },
    [editable, onLocationChange]
  );

  // Center on current location
  const handleCenter = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          setMarkerPosition({ lat, lng });
          onLocationChange?.(lat, lng);
          mapRef.current?.flyTo({
            center: [lng, lat],
            zoom: 16,
            duration: 1000,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, [onLocationChange]);

  return (
    <div className={cn('relative rounded-xl overflow-hidden w-full h-full', className)}>
      <Map
        ref={mapRef}
        initialViewState={{
          latitude: markerPosition.lat,
          longitude: markerPosition.lng,
          zoom: 15,
        }}
        mapStyle={MAP_STYLE}
        mapboxAccessToken={MAPBOX_TOKEN}
        onClick={handleMapClick}
        onError={(e) => {
          console.error('MiniMap error:', e);
          setMapError(e?.error?.message || 'Map error');
        }}
        interactive={editable}
        attributionControl={false}
        style={{ width: '100%', height: '100%' }}
      >
        <Marker
          latitude={markerPosition.lat}
          longitude={markerPosition.lng}
          anchor="bottom"
          draggable={editable}
          onDragEnd={(e) => {
            const { lat, lng } = e.lngLat;
            setMarkerPosition({ lat, lng });
            onLocationChange?.(lat, lng);
          }}
        >
          <div className="animate-bounce-in">
            <MapPin
              size={36}
              fill="#FF6B35"
              color="#1e293b"
              strokeWidth={1.5}
              style={{
                filter: 'drop-shadow(0 4px 8px rgba(255, 107, 53, 0.4))',
              }}
            />
          </div>
        </Marker>
      </Map>

      {/* Recenter button */}
      {editable && (
        <Button
          variant="secondary"
          size="sm"
          className="absolute bottom-3 right-3"
          onClick={handleCenter}
          icon={<Crosshair size={16} />}
        >
          Mi ubicación
        </Button>
      )}

      {/* Instructions overlay */}
      {editable && (
        <div className="absolute top-3 left-3 right-3">
          <div className="bg-dark-900/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-dark-300">
            📍 Toca el mapa o arrastra el marcador para ajustar la ubicación
          </div>
        </div>
      )}
    </div>
  );
}

