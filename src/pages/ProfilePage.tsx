import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ThumbsUp, MapPin, ChevronRight, Settings, Info } from 'lucide-react';
import { Header } from '../components/layout';
import { PotholeCard } from '../components/pothole';
import { Button, Card, Spinner, PotholeCardSkeleton } from '../components/ui';
import { useAuth, usePotholes } from '../hooks';
import { useStore } from '../store/useStore';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading, signOut } = useAuth();
  const { addToast } = useStore();
  const [showMyPotholes, setShowMyPotholes] = useState(false);

  // Fetch user's potholes
  const { potholes, loading: potholesLoading } = usePotholes({ limitCount: 50 });
  const userPotholes = potholes.filter((p) => p.userId === user?.id);

  const handleSignOut = async () => {
    try {
      await signOut();
      addToast({ type: 'success', message: '¡Hasta pronto!' });
    } catch (err) {
      addToast({ type: 'error', message: 'Error al cerrar sesión' });
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-dark-950 pb-20">
        <Header title="Perfil" />
        <div className="pt-14 p-4">
          <div className="max-w-sm mx-auto text-center space-y-8 py-12">
            {/* Hero */}
            <div className="space-y-4">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-full flex items-center justify-center">
                <span className="text-5xl">🕳️</span>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-display font-bold text-white">
                  ¡Únete a BoketesPR!
                </h1>
                <p className="text-dark-400">
                  Ayuda a mejorar las carreteras de Puerto Rico reportando boketes.
                </p>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-3 text-left">
              {[
                { icon: '📸', text: 'Reporta boketes con fotos geolocalizadas' },
                { icon: '🗺️', text: 'Visualiza todos los boketes en el mapa' },
                { icon: '👍', text: 'Vota para confirmar reportes' },
                { icon: '🔔', text: 'Recibe actualizaciones de tus reportes' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-dark-900/50 rounded-xl p-3"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-sm text-dark-300">{item.text}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Button
              onClick={() => navigate('/auth')}
              className="w-full"
              size="lg"
            >
              Crear cuenta o iniciar sesión
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated
  return (
    <div className="min-h-screen bg-dark-950 pb-20">
      <Header title="Mi Perfil" />

      <div className="pt-14 p-4 space-y-6">
        {/* Profile card */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-2xl font-bold text-white">
              {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-white truncate">
                {user.displayName || 'Usuario'}
              </h2>
              <p className="text-sm text-dark-400 truncate">{user.email}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-dark-800/50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-primary-500 mb-1">
                <MapPin size={18} />
                <span className="text-2xl font-bold">{user.reportsCount || 0}</span>
              </div>
              <p className="text-xs text-dark-400">Baches reportados</p>
            </div>
            <div className="bg-dark-800/50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-green-500 mb-1">
                <ThumbsUp size={18} />
                <span className="text-2xl font-bold">{user.upvotesReceived || 0}</span>
              </div>
              <p className="text-xs text-dark-400">Votos recibidos</p>
            </div>
          </div>
        </Card>

        {/* My potholes */}
        <Card padding="none">
          <button
            onClick={() => setShowMyPotholes(!showMyPotholes)}
            className="w-full flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center">
                <MapPin size={20} className="text-primary-500" />
              </div>
              <div className="text-left">
                <p className="font-medium text-white">Mis reportes</p>
                <p className="text-xs text-dark-400">
                  {userPotholes.length} {userPotholes.length === 1 ? 'bokete' : 'boketes'}
                </p>
              </div>
            </div>
            <ChevronRight
              size={20}
              className={`text-dark-400 transition-transform ${
                showMyPotholes ? 'rotate-90' : ''
              }`}
            />
          </button>

          {showMyPotholes && (
            <div className="px-4 pb-4 space-y-3 border-t border-dark-800 pt-4">
              {potholesLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <PotholeCardSkeleton key={i} />
                ))
              ) : userPotholes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-dark-400 text-sm">
                    Aún no has reportado ningún bokete.
                  </p>
                  <Button
                    onClick={() => navigate('/report')}
                    variant="ghost"
                    className="mt-4"
                  >
                    Reportar mi primer bokete
                  </Button>
                </div>
              ) : (
                userPotholes.map((pothole) => (
                  <PotholeCard key={pothole.id} pothole={pothole} />
                ))
              )}
            </div>
          )}
        </Card>

        {/* Settings links */}
        <Card padding="none">
          <button className="w-full flex items-center justify-between p-4 border-b border-dark-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-dark-800 rounded-xl flex items-center justify-center">
                <Settings size={20} className="text-dark-300" />
              </div>
              <span className="font-medium text-white">Configuración</span>
            </div>
            <ChevronRight size={20} className="text-dark-400" />
          </button>
          <button className="w-full flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-dark-800 rounded-xl flex items-center justify-center">
                <Info size={20} className="text-dark-300" />
              </div>
              <span className="font-medium text-white">Acerca de</span>
            </div>
            <ChevronRight size={20} className="text-dark-400" />
          </button>
        </Card>

        {/* Sign out */}
        <Button
          variant="ghost"
          className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
          icon={<LogOut size={18} />}
          onClick={handleSignOut}
        >
          Cerrar sesión
        </Button>

        {/* App version & Coquitech branding */}
        <div className="text-center space-y-2">
          <p className="text-xs text-dark-600">
            BoketesPR v1.0.0
          </p>
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

