import { useParams, useNavigate } from 'react-router-dom';
import { ThumbsUp, Share2, MapPin, Clock, Trash2 } from 'lucide-react';
import { Header } from '../components/layout';
import { MiniMap } from '../components/map';
import { Badge, Button, Spinner } from '../components/ui';
import { usePothole, usePotholeActions, useAuth } from '../hooks';
import { useStore } from '../store/useStore';
import { formatDate, formatRelativeTime } from '../lib/utils';

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addToast, openSignInPrompt } = useStore();
  const { pothole, loading, error } = usePothole(id);
  const { upvotePothole, deletePothole } = usePotholeActions();

  const hasUpvoted = user && pothole?.upvotedBy?.includes(user.id);
  const isOwner = user && pothole?.userId === user.id;

  const handleUpvote = async () => {
    if (!isAuthenticated) {
      openSignInPrompt('Inicia sesión para votar y confirmar boketes reportados.');
      return;
    }
    if (!pothole || !user) return;

    try {
      await upvotePothole(pothole.id, user.id, !!hasUpvoted);
    } catch (err) {
      addToast({ type: 'error', message: 'Error al votar' });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Bokete en BoketesPR - Powered by Coquitech AI',
          text: `Mira este bokete reportado en Puerto Rico`,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      addToast({ type: 'success', message: 'Enlace copiado' });
    }
  };

  const handleDelete = async () => {
    if (!pothole || !user) return;
    
    if (confirm('¿Estás seguro de eliminar este reporte?')) {
      try {
        await deletePothole(pothole.id, user.id);
        addToast({ type: 'success', message: 'Bokete eliminado' });
        navigate('/');
      } catch (err) {
        addToast({ type: 'error', message: 'Error al eliminar' });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !pothole) {
    return (
      <div className="min-h-screen bg-dark-950">
        <Header showBack />
        <div className="pt-14 flex items-center justify-center h-[calc(100vh-56px)]">
          <div className="text-center space-y-4">
            <div className="text-6xl">😕</div>
            <p className="text-dark-400">{error || 'Bache no encontrado'}</p>
            <Button onClick={() => navigate('/')} variant="secondary">
              Volver al mapa
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 pb-24">
      <Header showBack transparent />

      {/* Photo */}
      <div className="relative h-72">
        <img
          src={pothole.photoUrl}
          alt="Pothole"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/20 to-transparent" />
        
        {/* Badges overlay */}
        <div className="absolute bottom-4 left-4 flex gap-2">
          <Badge variant="severity" severity={pothole.severity} size="md" dot />
          <Badge variant="status" status={pothole.status} size="md" />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-4 relative z-10 space-y-6">
        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant={hasUpvoted ? 'primary' : 'secondary'}
            className="flex-1"
            icon={<ThumbsUp size={18} fill={hasUpvoted ? 'currentColor' : 'none'} />}
            onClick={handleUpvote}
          >
            {pothole.upvotes} {pothole.upvotes === 1 ? 'Voto' : 'Votos'}
          </Button>
          <Button
            variant="secondary"
            icon={<Share2 size={18} />}
            onClick={handleShare}
          >
            Compartir
          </Button>
        </div>

        {/* Description */}
        {pothole.description && (
          <div className="bg-dark-900/50 rounded-xl p-4">
            <p className="text-dark-200">{pothole.description}</p>
          </div>
        )}

        {/* Map */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-dark-300 flex items-center gap-2">
            <MapPin size={16} />
            Ubicación
          </h3>
          <div className="h-40 rounded-xl overflow-hidden border border-dark-800">
            <MiniMap
              latitude={pothole.location.latitude}
              longitude={pothole.location.longitude}
              editable={false}
            />
          </div>
          <p className="text-xs text-dark-500 text-center">
            {pothole.location.latitude.toFixed(6)}, {pothole.location.longitude.toFixed(6)}
          </p>
        </div>

        {/* Details */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-dark-300 flex items-center gap-2">
            <Clock size={16} />
            Detalles
          </h3>
          <div className="bg-dark-900/50 rounded-xl divide-y divide-dark-800">
            <div className="flex justify-between p-3">
              <span className="text-dark-400">Reportado</span>
              <span className="text-dark-200">
                {formatRelativeTime(pothole.createdAt.toDate())}
              </span>
            </div>
            <div className="flex justify-between p-3">
              <span className="text-dark-400">Fecha</span>
              <span className="text-dark-200">
                {formatDate(pothole.createdAt.toDate())}
              </span>
            </div>
            <div className="flex justify-between p-3">
              <span className="text-dark-400">ID</span>
              <span className="text-dark-500 text-xs font-mono">
                {pothole.id.slice(0, 8)}...
              </span>
            </div>
          </div>
        </div>

        {/* Delete button for owner */}
        {isOwner && (
          <Button
            variant="danger"
            className="w-full"
            icon={<Trash2 size={18} />}
            onClick={handleDelete}
          >
            Eliminar reporte
          </Button>
        )}
      </div>
    </div>
  );
}

