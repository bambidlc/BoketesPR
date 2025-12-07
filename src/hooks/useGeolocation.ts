import { useState, useEffect, useCallback } from 'react';
import { GeolocationState } from '../types';

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watch?: boolean;
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
    watch = false,
  } = options;

  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    loading: false,
    error: null,
  });

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    setState({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      loading: false,
      error: null,
    });
  }, []);

  const handleError = useCallback((error: GeolocationPositionError) => {
    let message: string;
    switch (error.code) {
      case error.PERMISSION_DENIED:
        message = 'Permiso de ubicación denegado. Por favor, habilita el acceso a tu ubicación.';
        break;
      case error.POSITION_UNAVAILABLE:
        message = 'No se pudo obtener tu ubicación. Verifica tu conexión.';
        break;
      case error.TIMEOUT:
        message = 'La solicitud de ubicación tardó demasiado. Intenta de nuevo.';
        break;
      default:
        message = 'Error al obtener ubicación';
    }
    setState((prev) => ({ ...prev, loading: false, error: message }));
  }, []);

  // Get current position once
  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: 'La geolocalización no está soportada en este navegador',
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy,
      timeout,
      maximumAge,
    });
  }, [enableHighAccuracy, timeout, maximumAge, handleSuccess, handleError]);

  // Watch position continuously
  useEffect(() => {
    if (!watch || !navigator.geolocation) return;

    setState((prev) => ({ ...prev, loading: true }));

    const watchId = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      { enableHighAccuracy, timeout, maximumAge }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [watch, enableHighAccuracy, timeout, maximumAge, handleSuccess, handleError]);

  // Check if location is available
  const isSupported = 'geolocation' in navigator;

  return {
    ...state,
    getCurrentPosition,
    isSupported,
  };
}

export default useGeolocation;

