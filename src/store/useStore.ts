import { create } from 'zustand';
import { Toast, MapViewport, PotholeFilters } from '../types';
import { generateId } from '../lib/utils';
import { DEFAULT_VIEWPORT } from '../lib/mapbox';

interface AppState {
  // Map state
  viewport: MapViewport;
  setViewport: (viewport: Partial<MapViewport>) => void;
  
  // Filters
  filters: PotholeFilters;
  setFilters: (filters: Partial<PotholeFilters>) => void;
  resetFilters: () => void;
  
  // Selected pothole for detail view
  selectedPotholeId: string | null;
  setSelectedPotholeId: (id: string | null) => void;
  
  // Toasts
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  
  // UI state
  isReportModalOpen: boolean;
  setReportModalOpen: (open: boolean) => void;
  
  // Sign-in prompt
  isSignInPromptOpen: boolean;
  signInPromptMessage: string;
  openSignInPrompt: (message?: string) => void;
  closeSignInPrompt: () => void;
}

const defaultFilters: PotholeFilters = {
  sortBy: 'newest',
};

export const useStore = create<AppState>((set) => ({
  // Map state
  viewport: DEFAULT_VIEWPORT,
  setViewport: (viewport) =>
    set((state) => ({ viewport: { ...state.viewport, ...viewport } })),
  
  // Filters
  filters: defaultFilters,
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () => set({ filters: defaultFilters }),
  
  // Selected pothole
  selectedPotholeId: null,
  setSelectedPotholeId: (id) => set({ selectedPotholeId: id }),
  
  // Toasts
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: generateId() }],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  
  // UI state
  isReportModalOpen: false,
  setReportModalOpen: (open) => set({ isReportModalOpen: open }),
  
  // Sign-in prompt
  isSignInPromptOpen: false,
  signInPromptMessage: '',
  openSignInPrompt: (message = 'Inicia sesión para acceder a todas las funciones de BoketesPR.') =>
    set({ isSignInPromptOpen: true, signInPromptMessage: message }),
  closeSignInPrompt: () => set({ isSignInPromptOpen: false }),
}));

export default useStore;

