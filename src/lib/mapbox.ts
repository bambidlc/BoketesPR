// Mapbox configuration
export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Map style - custom dark style optimized for road visibility
export const MAP_STYLE = 'mapbox://styles/mapbox/dark-v11';

// Puerto Rico default viewport
export const DEFAULT_VIEWPORT = {
  latitude: 18.2208,
  longitude: -66.5901,
  zoom: 9,
};

// Bounds to restrict panning
export const PR_BOUNDS: [[number, number], [number, number]] = [
  [-67.5, 17.8], // SW
  [-65.0, 18.7], // NE
];

// Cluster configuration
export const CLUSTER_CONFIG = {
  clusterMaxZoom: 14,
  clusterRadius: 50,
};

// Severity to color mapping for markers
export const SEVERITY_COLORS: Record<string, string> = {
  low: '#22c55e',      // Green
  medium: '#eab308',   // Yellow
  high: '#f97316',     // Orange
  critical: '#ef4444', // Red
};

// Marker size based on severity
export const SEVERITY_SIZES: Record<string, number> = {
  low: 20,
  medium: 24,
  high: 28,
  critical: 32,
};

// Generate GeoJSON from potholes
export interface PotholeGeoJSON {
  type: 'Feature';
  properties: {
    id: string;
    severity: string;
    status: string;
    photoUrl: string;
    upvotes: number;
    createdAt: string;
  };
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export const createPotholeGeoJSON = (pothole: {
  id: string;
  location: { latitude: number; longitude: number };
  severity: string;
  status: string;
  photoUrl: string;
  upvotes: number;
  createdAt: { toDate: () => Date };
}): PotholeGeoJSON => ({
  type: 'Feature',
  properties: {
    id: pothole.id,
    severity: pothole.severity,
    status: pothole.status,
    photoUrl: pothole.photoUrl,
    upvotes: pothole.upvotes,
    createdAt: pothole.createdAt.toDate().toISOString(),
  },
  geometry: {
    type: 'Point',
    coordinates: [pothole.location.longitude, pothole.location.latitude],
  },
});

