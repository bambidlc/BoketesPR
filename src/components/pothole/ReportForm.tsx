import { useState, useEffect, useCallback } from 'react';
import { Camera, MapPin, AlertTriangle, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../ui';
import { MiniMap } from '../map';
import { usePhotoCapture, useGeolocation, usePotholeActions, useAuth } from '../../hooks';
import { useStore } from '../../store/useStore';
import { Severity, SEVERITY_CONFIG } from '../../types';
import { cn, isInPuertoRico } from '../../lib/utils';

interface ReportFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ReportForm({ onSuccess, onCancel }: ReportFormProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useStore();
  const { createPothole, submitting } = usePotholeActions();
  const { photo, inputRef, openCamera, onInputChange, clearPhoto } = usePhotoCapture();
  const { latitude: geoLat, longitude: geoLng, getCurrentPosition } = useGeolocation();

  // Form state
  const [step, setStep] = useState(1);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [severity, setSeverity] = useState<Severity>('medium');
  const [description, setDescription] = useState('');
  const [locationError, setLocationError] = useState<string | null>(null);

  // Initialize location from photo EXIF or geolocation
  useEffect(() => {
    if (photo?.exifLocation) {
      setLatitude(photo.exifLocation.latitude);
      setLongitude(photo.exifLocation.longitude);
    } else if (geoLat && geoLng) {
      setLatitude(geoLat);
      setLongitude(geoLng);
    }
  }, [photo?.exifLocation, geoLat, geoLng]);

  // Get current location on mount
  useEffect(() => {
    getCurrentPosition();
  }, [getCurrentPosition]);

  // Handle location change from mini map
  const handleLocationChange = useCallback((lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    
    // Validate it's in Puerto Rico
    if (!isInPuertoRico(lat, lng)) {
      setLocationError('La ubicación debe estar en Puerto Rico');
    } else {
      setLocationError(null);
    }
  }, []);

  // Handle form submission
  const handleSubmit = async () => {
    if (!user || !photo?.file || latitude === null || longitude === null) {
      addToast({ type: 'error', message: 'Por favor completa todos los campos requeridos' });
      return;
    }

    if (!isInPuertoRico(latitude, longitude)) {
      addToast({ type: 'error', message: 'La ubicación debe estar en Puerto Rico' });
      return;
    }

    try {
      await createPothole({
        userId: user.id,
        location: {
          latitude,
          longitude,
          geohash: '', // Will be generated in the hook
        },
        severity,
        description: description.trim() || undefined,
        photo: photo.file,
      });

      addToast({ type: 'success', message: '¡Bokete reportado exitosamente!' });
      onSuccess?.();
      navigate('/');
    } catch (error: any) {
      console.error('Error creating pothole:', error);

      // Show specific error messages based on error type
      let errorMessage = 'Error al reportar el bokete. Intenta de nuevo.';

      if (error.message?.includes('CORS') ||
          error.message?.includes('conexión') ||
          error.message?.includes('servidor') ||
          error.message?.includes('configuración')) {
        errorMessage = error.message; // Use the detailed message from the hook
      } else if (error.message?.includes('ubicación')) {
        errorMessage = 'Error con la ubicación. Verifica que estés en Puerto Rico.';
      } else if (error.message?.includes('autenticación')) {
        errorMessage = 'Error de autenticación. Inicia sesión de nuevo.';
      }

      addToast({ type: 'error', message: errorMessage });
    }
  };

  // Severity options
  const severityOptions: { value: Severity; icon: string }[] = [
    { value: 'low', icon: '🟢' },
    { value: 'medium', icon: '🟡' },
    { value: 'high', icon: '🟠' },
    { value: 'critical', icon: '🔴' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onInputChange}
        className="hidden"
      />

      {/* Progress indicator */}
      <div className="flex items-center gap-2 px-4 py-3 bg-dark-900/50">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={cn(
              'flex-1 h-1 rounded-full transition-colors',
              step >= s ? 'bg-primary-500' : 'bg-dark-700'
            )}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-auto p-4">
        {/* Step 1: Photo */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-display font-semibold">Toma una foto</h2>
              <p className="text-dark-400 text-sm">
                Captura una foto clara del bokete
              </p>
            </div>

            {!photo ? (
              <Card
                className="aspect-[4/3] flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-dark-600 hover:border-primary-500 transition-colors"
                onClick={openCamera}
              >
                <div className="p-4 rounded-full bg-primary-500/10 mb-4">
                  <Camera size={40} className="text-primary-500" />
                </div>
                <p className="text-dark-300 font-medium">Toca para tomar foto</p>
                <p className="text-dark-500 text-sm mt-1">o seleccionar de la galería</p>
              </Card>
            ) : (
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                <img
                  src={photo.preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={clearPhoto}
                  className="absolute top-3 right-3 p-2 bg-dark-900/80 rounded-full hover:bg-red-600 transition-colors"
                >
                  <X size={20} />
                </button>
                {photo.exifLocation && (
                  <div className="absolute bottom-3 left-3 bg-dark-900/80 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs">
                    <MapPin size={14} className="text-primary-500" />
                    <span>GPS encontrado en la foto</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-display font-semibold">Ubicación del bokete</h2>
              <p className="text-dark-400 text-sm">
                Ajusta la ubicación si es necesario
              </p>
            </div>

            <div className="h-64 rounded-2xl overflow-hidden border border-dark-700">
              {latitude !== null && longitude !== null ? (
                <MiniMap
                  latitude={latitude}
                  longitude={longitude}
                  onLocationChange={handleLocationChange}
                  editable
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-dark-800">
                  <div className="text-center space-y-3">
                    <div className="animate-spin w-8 h-8 border-2 border-dark-600 border-t-primary-500 rounded-full mx-auto" />
                    <p className="text-dark-400 text-sm">Obteniendo ubicación...</p>
                  </div>
                </div>
              )}
            </div>

            {locationError && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2">
                <AlertTriangle size={16} />
                {locationError}
              </div>
            )}

            {latitude !== null && longitude !== null && (
              <p className="text-xs text-dark-500 text-center">
                📍 {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </p>
            )}
          </div>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-display font-semibold">Detalles del bokete</h2>
              <p className="text-dark-400 text-sm">
                Indica la severidad del bokete
              </p>
            </div>

            {/* Severity selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-dark-200">Severidad</label>
              <div className="grid grid-cols-4 gap-2">
                {severityOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSeverity(option.value)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all',
                      severity === option.value
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-dark-700 hover:border-dark-600'
                    )}
                  >
                    <span className="text-2xl">{option.icon}</span>
                    <span className="text-xs text-dark-300">
                      {SEVERITY_CONFIG[option.value].labelEs}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-dark-200">
                Descripción (opcional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: Bache grande en el carril derecho..."
                rows={3}
                maxLength={200}
                className="w-full bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
              <p className="text-xs text-dark-500 text-right">
                {description.length}/200
              </p>
            </div>

            {/* Preview */}
            {photo && (
              <div className="flex gap-3 p-3 bg-dark-800/50 rounded-xl">
                <img
                  src={photo.preview}
                  alt="Preview"
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{severityOptions.find((o) => o.value === severity)?.icon}</span>
                    <span className="text-sm font-medium">{SEVERITY_CONFIG[severity].labelEs}</span>
                  </div>
                  <p className="text-xs text-dark-400">
                    📍 {latitude?.toFixed(4)}, {longitude?.toFixed(4)}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="p-4 border-t border-dark-800 bg-dark-950">
        <div className="flex gap-3">
          {step > 1 ? (
            <Button
              variant="secondary"
              onClick={() => setStep(step - 1)}
              className="flex-1"
            >
              Atrás
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={onCancel}
              className="flex-1"
            >
              Cancelar
            </Button>
          )}

          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && !photo) ||
                (step === 2 && (latitude === null || longitude === null || !!locationError))
              }
              className="flex-1"
              icon={<Check size={18} />}
              iconPosition="right"
            >
              Siguiente
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              loading={submitting}
              disabled={!photo || latitude === null || longitude === null}
              className="flex-1"
              icon={<Check size={18} />}
              iconPosition="right"
            >
              Reportar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

