import { useState, useCallback, useRef } from 'react';
import exifr from 'exifr';

interface PhotoData {
  file: File;
  preview: string;
  exifLocation: {
    latitude: number;
    longitude: number;
  } | null;
}

export function usePhotoCapture() {
  const [photo, setPhoto] = useState<PhotoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Extract GPS data from photo EXIF
  const extractGpsFromExif = async (file: File): Promise<{ latitude: number; longitude: number } | null> => {
    try {
      const gps = await exifr.gps(file);
      if (gps?.latitude && gps?.longitude) {
        return {
          latitude: gps.latitude,
          longitude: gps.longitude,
        };
      }
      return null;
    } catch (err) {
      console.log('No EXIF GPS data found:', err);
      return null;
    }
  };

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Por favor selecciona una imagen válida');
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('La imagen es muy grande. Máximo 10MB.');
      }

      // Create preview URL
      const preview = URL.createObjectURL(file);

      // Try to extract GPS from EXIF
      const exifLocation = await extractGpsFromExif(file);

      setPhoto({
        file,
        preview,
        exifLocation,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la imagen');
    } finally {
      setLoading(false);
    }
  }, []);

  // Trigger file input click
  const openCamera = useCallback(() => {
    inputRef.current?.click();
  }, []);

  // Handle input change
  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
      // Reset input so same file can be selected again
      e.target.value = '';
    },
    [handleFileSelect]
  );

  // Clear photo
  const clearPhoto = useCallback(() => {
    if (photo?.preview) {
      URL.revokeObjectURL(photo.preview);
    }
    setPhoto(null);
    setError(null);
  }, [photo]);

  return {
    photo,
    loading,
    error,
    inputRef,
    openCamera,
    onInputChange,
    clearPhoto,
    handleFileSelect,
  };
}

export default usePhotoCapture;

