import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  transparent?: boolean;
  rightElement?: React.ReactNode;
  className?: string;
}

export default function Header({
  title,
  showBack = false,
  transparent = false,
  rightElement,
  className,
}: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-30 h-14 flex items-center px-4',
        transparent
          ? 'bg-gradient-to-b from-dark-950/80 to-transparent'
          : 'bg-dark-950/95 backdrop-blur-lg border-b border-dark-800',
        className
      )}
    >
      {/* Left side */}
      <div className="w-12">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-xl text-dark-300 hover:text-white hover:bg-dark-800 transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
        )}
      </div>

      {/* Title */}
      <div className="flex-1 text-center">
        {title && (
          <h1 className="font-display font-semibold text-lg text-white truncate">
            {title}
          </h1>
        )}
      </div>

      {/* Right side */}
      <div className="w-12 flex justify-end">
        {rightElement}
      </div>
    </header>
  );
}

