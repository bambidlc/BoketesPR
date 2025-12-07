import { useState } from 'react';
import { SlidersHorizontal, MapPin } from 'lucide-react';
import { Header } from '../components/layout';
import { PotholeCard } from '../components/pothole';
import { PotholeCardSkeleton } from '../components/ui';
import { usePotholes, useGeolocation } from '../hooks';
import { useStore } from '../store/useStore';
import { Severity, Status, SEVERITY_CONFIG, STATUS_CONFIG } from '../types';
import { cn, calculateDistance, formatDistance } from '../lib/utils';

export default function ListPage() {
  const { latitude, longitude } = useGeolocation({ watch: true });
  const { filters, setFilters } = useStore();
  const { potholes, loading, error } = usePotholes({ filters });
  const [showFilters, setShowFilters] = useState(false);

  // Sort potholes
  const sortedPotholes = [...potholes].sort((a, b) => {
    switch (filters.sortBy) {
      case 'upvotes':
        return b.upvotes - a.upvotes;
      case 'nearest':
        if (latitude && longitude) {
          const distA = calculateDistance(
            latitude,
            longitude,
            a.location.latitude,
            a.location.longitude
          );
          const distB = calculateDistance(
            latitude,
            longitude,
            b.location.latitude,
            b.location.longitude
          );
          return distA - distB;
        }
        return 0;
      default:
        return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime();
    }
  });

  // Add distance to each pothole
  const potholesWithDistance = sortedPotholes.map((p) => ({
    ...p,
    distance:
      latitude && longitude
        ? calculateDistance(latitude, longitude, p.location.latitude, p.location.longitude)
        : null,
  }));

  return (
    <div className="min-h-screen bg-dark-950 pb-20">
      <Header
        title="Lista de Boketes"
        rightElement={
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'p-2 rounded-xl transition-colors',
              showFilters ? 'bg-primary-500/20 text-primary-500' : 'text-dark-400 hover:text-white'
            )}
          >
            <SlidersHorizontal size={20} />
          </button>
        }
      />

      <div className="pt-14">
        {/* Filters panel */}
        {showFilters && (
          <div className="p-4 border-b border-dark-800 space-y-4 animate-slide-up">
            {/* Sort options */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-dark-400 uppercase tracking-wider">
                Ordenar por
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'newest', label: 'Recientes' },
                  { value: 'upvotes', label: 'Populares' },
                  { value: 'nearest', label: 'Cercanos' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilters({ sortBy: option.value as typeof filters.sortBy })}
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-lg transition-colors',
                      filters.sortBy === option.value
                        ? 'bg-primary-500 text-white'
                        : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Severity filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-dark-400 uppercase tracking-wider">
                Severidad
              </label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(SEVERITY_CONFIG) as Severity[]).map((sev) => {
                  const isSelected = filters.severity?.includes(sev);
                  return (
                    <button
                      key={sev}
                      onClick={() => {
                        const current = filters.severity || [];
                        setFilters({
                          severity: isSelected
                            ? current.filter((s) => s !== sev)
                            : [...current, sev],
                        });
                      }}
                      className={cn(
                        'px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1.5',
                        isSelected
                          ? `${SEVERITY_CONFIG[sev].bgColor}/20 ${SEVERITY_CONFIG[sev].color}`
                          : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                      )}
                    >
                      <span
                        className={cn(
                          'w-2 h-2 rounded-full',
                          SEVERITY_CONFIG[sev].bgColor
                        )}
                      />
                      {SEVERITY_CONFIG[sev].labelEs}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-dark-400 uppercase tracking-wider">
                Estado
              </label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(STATUS_CONFIG) as Status[]).map((stat) => {
                  const isSelected = filters.status?.includes(stat);
                  return (
                    <button
                      key={stat}
                      onClick={() => {
                        const current = filters.status || [];
                        setFilters({
                          status: isSelected
                            ? current.filter((s) => s !== stat)
                            : [...current, stat],
                        });
                      }}
                      className={cn(
                        'px-3 py-1.5 text-sm rounded-lg transition-colors',
                        isSelected
                          ? `${STATUS_CONFIG[stat].bgColor}/20 ${STATUS_CONFIG[stat].color}`
                          : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                      )}
                    >
                      {STATUS_CONFIG[stat].labelEs}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* List */}
        <div className="p-4 space-y-3">
          {loading ? (
            // Skeleton loaders
            Array.from({ length: 5 }).map((_, i) => (
              <PotholeCardSkeleton key={i} />
            ))
          ) : error ? (
            // Error state
            <div className="text-center py-12">
              <p className="text-dark-400">{error}</p>
            </div>
          ) : potholesWithDistance.length === 0 ? (
            // Empty state
            <div className="text-center py-12 space-y-4">
              <div className="text-6xl">🕳️</div>
              <p className="text-dark-400">
                No hay boketes reportados todavía.
              </p>
              <p className="text-sm text-dark-500">
                ¡Sé el primero en reportar uno!
              </p>
            </div>
          ) : (
            // Pothole cards
            potholesWithDistance.map((pothole) => (
              <div key={pothole.id} className="relative">
                <PotholeCard pothole={pothole} />
                {pothole.distance !== null && (
                  <div className="absolute top-3 right-3 bg-dark-800/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1 text-xs text-dark-300">
                    <MapPin size={12} />
                    {formatDistance(pothole.distance)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Stats & Coquitech branding */}
        <div className="p-4 text-center space-y-2">
          {!loading && potholes.length > 0 && (
            <p className="text-xs text-dark-500">
              Mostrando {potholes.length} boketes
            </p>
          )}
          <a
            href="https://coquitech.org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-dark-500 hover:text-dark-300 transition-colors"
          >
            <span className="text-[10px]">Powered by</span>
            <span className="text-xs font-semibold text-primary-400">Coquitech AI Agency</span>
          </a>
        </div>
      </div>
    </div>
  );
}

