import { useNavigate } from 'react-router-dom';
import { MapView } from '../components/map';
import { MapSkeleton } from '../components/ui';
import { usePotholes } from '../hooks';
import { Pothole } from '../types';

export default function MapPage() {
  const navigate = useNavigate();
  const { potholes, loading, error } = usePotholes({ limitCount: 200 });

  const handlePotholeClick = (pothole: Pothole) => {
    navigate(`/pothole/${pothole.id}`);
  };

  if (loading) {
    return (
      <div className="h-screen">
        <MapSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-dark-950">
        <div className="text-center space-y-4 p-8">
          <div className="text-4xl">😕</div>
          <p className="text-dark-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-primary-500 hover:underline"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen pb-16">
      {/* Logo overlay */}
      <div className="absolute top-4 left-4 z-20">
        <div className="bg-dark-950/80 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-lg">🕳️</span>
          </div>
          <div>
            <h1 className="font-display font-bold text-white text-sm leading-none">
              BoketesPR
            </h1>
            <p className="text-[10px] text-dark-400">
              {potholes.length} boketes reportados
            </p>
          </div>
        </div>
      </div>

      {/* Coquitech branding */}
      <div className="absolute bottom-20 right-4 z-20">
        <a
          href="https://coquitech.org"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-dark-950/80 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1 text-[9px] text-dark-400 hover:text-dark-200 transition-colors"
        >
          <span>by</span>
          <span className="font-semibold text-primary-400">Coquitech AI</span>
        </a>
      </div>

      {/* Map */}
      <MapView
        potholes={potholes}
        onPotholeClick={handlePotholeClick}
      />
    </div>
  );
}

