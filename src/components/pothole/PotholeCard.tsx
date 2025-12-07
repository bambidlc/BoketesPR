import { ThumbsUp, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Pothole } from '../../types';
import { Card, Badge } from '../ui';
import { formatRelativeTime, truncate } from '../../lib/utils';

interface PotholeCardProps {
  pothole: Pothole;
}

export default function PotholeCard({ pothole }: PotholeCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      hoverable
      padding="none"
      className="overflow-hidden"
      onClick={() => navigate(`/pothole/${pothole.id}`)}
    >
      <div className="flex gap-3 p-3">
        {/* Photo thumbnail */}
        <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden">
          <img
            src={pothole.photoUrl}
            alt="Pothole"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          {/* Badges */}
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="severity" severity={pothole.severity} size="sm" dot />
            <Badge variant="status" status={pothole.status} size="sm" />
          </div>

          {/* Description */}
          {pothole.description && (
            <p className="text-sm text-dark-300 line-clamp-2">
              {truncate(pothole.description, 60)}
            </p>
          )}

          {/* Meta info */}
          <div className="flex items-center gap-4 text-xs text-dark-400">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {formatRelativeTime(pothole.createdAt.toDate())}
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp size={12} />
              {pothole.upvotes}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

