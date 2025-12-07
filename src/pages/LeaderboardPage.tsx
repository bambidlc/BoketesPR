import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Trophy, Medal, Award, MapPin, ThumbsUp, ExternalLink } from 'lucide-react';
import { Header } from '../components/layout';
import { Card, Spinner } from '../components/ui';
import { db } from '../lib/firebase';
import { cn } from '../lib/utils';

interface LeaderboardUser {
  id: string;
  displayName: string;
  email: string;
  reportsCount: number;
  upvotesReceived: number;
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'reports' | 'upvotes'>('reports');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const usersRef = collection(db, 'users');
        const q = query(
          usersRef,
          orderBy(sortBy === 'reports' ? 'reportsCount' : 'upvotesReceived', 'desc'),
          limit(50)
        );
        const snapshot = await getDocs(q);
        const usersData = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((user) => (user as LeaderboardUser).reportsCount > 0) as LeaderboardUser[];
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [sortBy]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return (
          <span className="w-6 h-6 flex items-center justify-center text-dark-400 font-bold">
            {rank}
          </span>
        );
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-yellow-500/30';
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-500/10 border-gray-400/30';
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-amber-700/10 border-amber-600/30';
      default:
        return 'bg-dark-900/50 border-dark-700';
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 pb-20">
      <Header title="Tabla de Líderes" showBack />

      <div className="pt-14 p-4 space-y-4">
        {/* Header */}
        <div className="text-center space-y-2 py-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-2xl flex items-center justify-center">
            <Trophy className="w-8 h-8 text-yellow-400" />
          </div>
          <h2 className="text-xl font-display font-bold text-white">
            Héroes de las Carreteras
          </h2>
          <p className="text-dark-400 text-sm">
            Los ciudadanos que más contribuyen a mejorar Puerto Rico
          </p>
        </div>

        {/* Sort tabs */}
        <div className="flex gap-2 bg-dark-900/50 p-1 rounded-xl">
          <button
            onClick={() => setSortBy('reports')}
            className={cn(
              'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2',
              sortBy === 'reports'
                ? 'bg-primary-500 text-white'
                : 'text-dark-400 hover:text-white'
            )}
          >
            <MapPin size={16} />
            Más Reportes
          </button>
          <button
            onClick={() => setSortBy('upvotes')}
            className={cn(
              'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2',
              sortBy === 'upvotes'
                ? 'bg-primary-500 text-white'
                : 'text-dark-400 hover:text-white'
            )}
          >
            <ThumbsUp size={16} />
            Más Votos
          </button>
        </div>

        {/* Leaderboard list */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="text-6xl">🏆</div>
            <p className="text-dark-400">
              ¡Sé el primero en reportar un bokete y aparecer aquí!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((user, index) => (
              <Card
                key={user.id}
                className={cn(
                  'border transition-all hover:scale-[1.01]',
                  getRankBg(index + 1)
                )}
                padding="sm"
              >
                <div className="flex items-center gap-3">
                  {/* Rank */}
                  <div className="w-10 flex justify-center">
                    {getRankIcon(index + 1)}
                  </div>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold">
                    {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">
                      {user.displayName || 'Usuario'}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-dark-400">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {user.reportsCount} reportes
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp size={12} />
                        {user.upvotesReceived || 0} votos
                      </span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary-400">
                      {sortBy === 'reports' ? user.reportsCount : user.upvotesReceived || 0}
                    </p>
                    <p className="text-[10px] text-dark-500 uppercase">
                      {sortBy === 'reports' ? 'reportes' : 'votos'}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Coquitech branding */}
        <div className="pt-8 pb-4">
          <a
            href="https://coquitech.org"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-dark-500 hover:text-dark-300 transition-colors"
          >
            <span className="text-xs">Powered by</span>
            <span className="text-sm font-semibold text-primary-400">Coquitech AI Agency</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}

