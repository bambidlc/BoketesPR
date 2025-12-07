import { useNavigate } from 'react-router-dom';
import { LogIn, ExternalLink } from 'lucide-react';
import { Modal, Button } from '../ui';

interface SignInPromptProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
  title?: string;
}

export default function SignInPrompt({
  isOpen,
  onClose,
  message = 'Inicia sesión para acceder a todas las funciones de BoketesPR.',
  title = '¡Únete a la comunidad!',
}: SignInPromptProps) {
  const navigate = useNavigate();

  const handleSignIn = () => {
    onClose();
    navigate('/auth');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center space-y-6 p-2">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-full flex items-center justify-center">
          <span className="text-4xl">🕳️</span>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h3 className="text-xl font-display font-bold text-white">{title}</h3>
          <p className="text-dark-400 text-sm">{message}</p>
        </div>

        {/* Benefits */}
        <div className="bg-dark-800/50 rounded-xl p-4 space-y-3 text-left">
          {[
            { icon: '📸', text: 'Reporta boketes con fotos' },
            { icon: '🗺️', text: 'Aparece en la tabla de líderes' },
            { icon: '👍', text: 'Vota para confirmar reportes' },
            { icon: '🏆', text: 'Gana reconocimiento en tu comunidad' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm text-dark-300">{item.text}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button onClick={handleSignIn} className="w-full" size="lg" icon={<LogIn size={18} />}>
            Iniciar sesión
          </Button>
          <button
            onClick={onClose}
            className="text-dark-400 hover:text-dark-300 text-sm transition-colors"
          >
            Continuar como invitado
          </button>
        </div>

        {/* Coquitech branding */}
        <a
          href="https://coquitech.org"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-dark-500 hover:text-dark-300 transition-colors pt-2"
        >
          <span className="text-[10px]">Powered by</span>
          <span className="text-xs font-semibold text-primary-400">Coquitech AI Agency</span>
          <ExternalLink size={10} />
        </a>
      </div>
    </Modal>
  );
}

