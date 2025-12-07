import { Timestamp } from 'firebase/firestore';

// Severity levels for potholes
export type Severity = 'low' | 'medium' | 'high' | 'critical';

// Status of a pothole report
export type Status = 'reported' | 'verified' | 'in_progress' | 'fixed';

// Location with geohash for Firebase queries
export interface GeoLocation {
  latitude: number;
  longitude: number;
  geohash: string;
}

// Main Pothole document structure
export interface Pothole {
  id: string;
  userId: string;
  location: GeoLocation;
  address?: string;
  severity: Severity;
  status: Status;
  photoUrl: string; // Now stores base64 data URL
  thumbnailUrl?: string; // Not used with base64 approach
  description?: string;
  upvotes: number;
  upvotedBy: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// For creating new potholes (without id and timestamps)
export interface CreatePotholeData {
  userId: string;
  location: GeoLocation;
  address?: string;
  severity: Severity;
  description?: string;
}

// For creating potholes with photo file (used internally)
export interface CreatePotholeWithPhoto extends Omit<CreatePotholeData, 'photoUrl'> {
  photo: File;
}

// User profile document
export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  photoUrl?: string;
  reportsCount: number;
  upvotesReceived: number;
  createdAt: Timestamp;
}

// For the report form
export interface ReportFormData {
  photo: File | null;
  latitude: number | null;
  longitude: number | null;
  severity: Severity;
  description: string;
}

// Map viewport state
export interface MapViewport {
  latitude: number;
  longitude: number;
  zoom: number;
}

// Filter options for list view
export interface PotholeFilters {
  severity?: Severity[];
  status?: Status[];
  sortBy: 'newest' | 'upvotes' | 'nearest';
}

// Geolocation hook state
export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
}

// Auth state
export interface AuthState {
  user: UserProfile | null;
  firebaseUser: import('firebase/auth').User | null;
  loading: boolean;
  error: string | null;
}

// Toast notification
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

// Severity config for UI
export const SEVERITY_CONFIG: Record<Severity, { label: string; labelEs: string; color: string; bgColor: string }> = {
  low: { 
    label: 'Low', 
    labelEs: 'Bajo', 
    color: 'text-severity-low', 
    bgColor: 'bg-severity-low' 
  },
  medium: { 
    label: 'Medium', 
    labelEs: 'Medio', 
    color: 'text-severity-medium', 
    bgColor: 'bg-severity-medium' 
  },
  high: { 
    label: 'High', 
    labelEs: 'Alto', 
    color: 'text-severity-high', 
    bgColor: 'bg-severity-high' 
  },
  critical: { 
    label: 'Critical', 
    labelEs: 'Crítico', 
    color: 'text-severity-critical', 
    bgColor: 'bg-severity-critical' 
  },
};

// Status config for UI
export const STATUS_CONFIG: Record<Status, { label: string; labelEs: string; color: string; bgColor: string }> = {
  reported: { 
    label: 'Reported', 
    labelEs: 'Reportado', 
    color: 'text-status-reported', 
    bgColor: 'bg-status-reported' 
  },
  verified: { 
    label: 'Verified', 
    labelEs: 'Verificado', 
    color: 'text-status-verified', 
    bgColor: 'bg-status-verified' 
  },
  in_progress: { 
    label: 'In Progress', 
    labelEs: 'En Progreso', 
    color: 'text-status-in-progress', 
    bgColor: 'bg-status-in-progress' 
  },
  fixed: { 
    label: 'Fixed', 
    labelEs: 'Arreglado', 
    color: 'text-status-fixed', 
    bgColor: 'bg-status-fixed' 
  },
};

// Puerto Rico bounds
export const PR_BOUNDS = {
  sw: { lat: 17.9, lng: -67.3 },
  ne: { lat: 18.6, lng: -65.2 },
  center: { lat: 18.2208, lng: -66.5901 },
};

