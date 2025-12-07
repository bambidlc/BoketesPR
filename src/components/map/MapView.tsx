import { useCallback, useMemo, useRef, useState } from 'react';
import Map, { 
  Marker, 
  NavigationControl, 
  GeolocateControl,
  Popup,
  MapRef,
} from 'react-map-gl';
import { MapPin } from 'lucide-react';
import { MAPBOX_TOKEN, MAP_STYLE, PR_BOUNDS, SEVERITY_COLORS } from '../../lib/mapbox';
import { Pothole } from '../../types';
import { useStore } from '../../store/useStore';
import { cn, formatRelativeTime } from '../../lib/utils';
import { Badge } from '../ui';

interface MapViewProps {
  potholes: Pothole[];
  onPotholeClick?: (pothole: Pothole) => void;
  interactive?: boolean;
  showControls?: boolean;
  className?: string;
}

export default function MapView({
  potholes,
  onPotholeClick,
  interactive = true,
  showControls = true,
  className,
}: MapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const { viewport, setViewport, selectedPotholeId, setSelectedPotholeId } = useStore();
  const [popupInfo, setPopupInfo] = useState<Pothole | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // Check for valid Mapbox token
  const isValidToken = MAPBOX_TOKEN && MAPBOX_TOKEN.length > 50 && MAPBOX_TOKEN.startsWith('pk.');

  if (!isValidToken) {
    return (
      <div className={cn('relative w-full h-full flex items-center justify-center bg-dark-900', className)}>
        <div className="text-center space-y-4 p-8 max-w-sm">
          <div className="text-4xl">🗺️</div>
          <h3 className="text-lg font-semibold text-white">Mapbox Token Required</h3>
          <p className="text-dark-400 text-sm">
            The map cannot load because a valid Mapbox token is not configured.
          </p>
          <div className="bg-dark-800 rounded-lg p-4 text-left">
            <p className="text-dark-300 text-sm mb-2">To fix this:</p>
            <ol className="text-dark-400 text-xs space-y-1 list-decimal list-inside">
              <li>Go to <a href="https://account.mapbox.com/access-tokens/" className="text-primary-400 underline" target="_blank" rel="noopener noreferrer">Mapbox Account</a></li>
              <li>Create or copy a public token</li>
              <li>Update <code className="bg-dark-700 px-1 py-0.5 rounded">VITE_MAPBOX_TOKEN</code> in your .env file</li>
              <li>Rebuild and redeploy the app</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }


  // Handle marker click
  const handleMarkerClick = useCallback(
    (pothole: Pothole) => {
      setPopupInfo(pothole);
      setSelectedPotholeId(pothole.id);
      
      // Fly to the pothole
      mapRef.current?.flyTo({
        center: [pothole.location.longitude, pothole.location.latitude],
        zoom: 15,
        duration: 1000,
      });
    },
    [setSelectedPotholeId]
  );

  // Handle popup close
  const handlePopupClose = useCallback(() => {
    setPopupInfo(null);
    setSelectedPotholeId(null);
  }, [setSelectedPotholeId]);

  // Handle map move
  const handleMove = useCallback(
    (evt: { viewState: { latitude: number; longitude: number; zoom: number } }) => {
      setViewport({
        latitude: evt.viewState.latitude,
        longitude: evt.viewState.longitude,
        zoom: evt.viewState.zoom,
      });
    },
    [setViewport]
  );

  // Cluster markers when zoomed out (simple approach)
  const markers = useMemo(() => {
    return potholes.map((pothole) => (
      <Marker
        key={pothole.id}
        longitude={pothole.location.longitude}
        latitude={pothole.location.latitude}
        anchor="bottom"
        onClick={(e) => {
          e.originalEvent.stopPropagation();
          handleMarkerClick(pothole);
        }}
      >
        <div
          className={cn(
            'cursor-pointer transform transition-all duration-200',
            'hover:scale-110 active:scale-95',
            selectedPotholeId === pothole.id && 'scale-125'
          )}
        >
          <div
            className="relative animate-bounce-in"
            style={{
              filter: `drop-shadow(0 4px 6px ${SEVERITY_COLORS[pothole.severity]}40)`,
            }}
          >
            <MapPin
              size={selectedPotholeId === pothole.id ? 36 : 28}
              fill={SEVERITY_COLORS[pothole.severity]}
              color="#1e293b"
              strokeWidth={1.5}
            />
            {pothole.upvotes > 0 && (
              <span className="absolute -top-1 -right-1 bg-dark-900 text-white text-[10px] font-bold px-1 rounded-full min-w-[16px] text-center">
                {pothole.upvotes}
              </span>
            )}
          </div>
        </div>
      </Marker>
    ));
  }, [potholes, selectedPotholeId, handleMarkerClick]);

  // Handle map error
  const handleError = useCallback((error: any) => {
    console.error('Map error:', error);
    setMapError(error?.error?.message || 'Error loading map');
  }, []);

  // Show error state if map fails to load
  if (mapError) {
    return (
      <div className={cn('relative w-full h-full flex items-center justify-center bg-dark-900', className)}>
        <div className="text-center space-y-4 p-8">
          <div className="text-4xl">🗺️</div>
          <p className="text-dark-300">Error loading map</p>
          <p className="text-dark-500 text-sm">{mapError}</p>
          <button
            onClick={() => {
              setMapError(null);
              window.location.reload();
            }}
            className="text-primary-500 hover:underline"
          >
            Reload page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative w-full h-full', className)}>
      <Map
        ref={mapRef}
        {...viewport}
        onMove={handleMove}
        onError={handleError}
        mapStyle={MAP_STYLE}
        mapboxAccessToken={MAPBOX_TOKEN}
        maxBounds={PR_BOUNDS}
        minZoom={8}
        maxZoom={18}
        interactive={interactive}
        attributionControl={false}
        reuseMaps
      >
        {/* Navigation controls */}
        {showControls && (
          <>
            <NavigationControl position="top-right" showCompass={false} />
            <GeolocateControl
              position="top-right"
              trackUserLocation
              showUserHeading
              positionOptions={{ enableHighAccuracy: true }}
            />
          </>
        )}

        {/* Pothole markers */}
        {markers}

        {/* Popup for selected pothole */}
        {popupInfo && (
          <Popup
            longitude={popupInfo.location.longitude}
            latitude={popupInfo.location.latitude}
            anchor="bottom"
            onClose={handlePopupClose}
            closeButton={false}
            className="pothole-popup"
            offset={[0, -30]}
          >
            <div
              className="bg-dark-900 rounded-xl overflow-hidden shadow-2xl cursor-pointer min-w-[200px]"
              onClick={() => onPotholeClick?.(popupInfo)}
            >
              {/* Photo */}
              <div className="relative h-24 overflow-hidden">
                <img
                  src={popupInfo.photoUrl}
                  alt="Pothole"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900 to-transparent" />
              </div>

              {/* Info */}
              <div className="p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="severity" severity={popupInfo.severity} size="sm" dot />
                  <Badge variant="status" status={popupInfo.status} size="sm" />
                </div>
                
                <div className="flex items-center justify-between text-xs text-dark-400">
                  <span>{formatRelativeTime(popupInfo.createdAt.toDate())}</span>
                  <span className="flex items-center gap-1">
                    <span>👍</span>
                    <span>{popupInfo.upvotes}</span>
                  </span>
                </div>

                <p className="text-xs text-primary-400 font-medium">
                  Toca para ver detalles →
                </p>
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Custom attribution */}
      <div className="absolute bottom-16 left-2 text-[10px] text-dark-500">
        © Mapbox © OpenStreetMap
      </div>
    </div>
  );
}

