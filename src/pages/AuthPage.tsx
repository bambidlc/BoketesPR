import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Header } from '../components/layout';
import { Button, Input } from '../components/ui';
import { useAuth } from '../hooks';
import { useStore } from '../store/useStore';

type AuthMode = 'login' | 'signup' | 'forgot';

export default function AuthPage() {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, resetPassword, loading, error } = useAuth();
  const { addToast } = useStore();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    try {
      if (mode === 'login') {
        await signIn(email, password);
        addToast({ type: 'success', message: '¡Bienvenido de vuelta!' });
        navigate('/');
      } else if (mode === 'signup') {
        await signUp(email, password);
        addToast({ type: 'success', message: '¡Cuenta creada exitosamente!' });
        navigate('/');
      } else if (mode === 'forgot') {
        await resetPassword(email);
        addToast({ type: 'success', message: 'Revisa tu correo para restablecer tu contraseña' });
        setMode('login');
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    try {
      await signInWithGoogle();
      addToast({ type: 'success', message: '¡Bienvenido!' });
      navigate('/');
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Error al iniciar con Google');
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-dark-950">
      <Header showBack />

      <div className="pt-14 p-4">
        <div className="max-w-sm mx-auto space-y-8 py-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-3xl">🕳️</span>
            </div>
            <h1 className="text-2xl font-display font-bold text-white">
              {mode === 'login' && 'Iniciar sesión'}
              {mode === 'signup' && 'Crear cuenta'}
              {mode === 'forgot' && 'Recuperar contraseña'}
            </h1>
            <p className="text-dark-400 text-sm">
              {mode === 'login' && 'Ingresa a tu cuenta de BoketesPR'}
              {mode === 'signup' && 'Únete a la comunidad de BoketesPR'}
              {mode === 'forgot' && 'Te enviaremos un enlace para restablecer tu contraseña'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              icon={<Mail size={18} />}
              required
            />

            {mode !== 'forgot' && (
              <div className="relative">
                <Input
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  icon={<Lock size={18} />}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-dark-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            )}

            {displayError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
                {displayError}
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
              icon={<ArrowRight size={18} />}
              iconPosition="right"
            >
              {mode === 'login' && 'Iniciar sesión'}
              {mode === 'signup' && 'Crear cuenta'}
              {mode === 'forgot' && 'Enviar enlace'}
            </Button>
          </form>

          {/* Divider */}
          {mode !== 'forgot' && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-dark-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-dark-950 text-dark-500">o continúa con</span>
                </div>
              </div>

              {/* Social login */}
              <Button
                variant="secondary"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
            </>
          )}

          {/* Mode switch */}
          <div className="text-center space-y-2">
            {mode === 'login' && (
              <>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-sm text-dark-400 hover:text-primary-500 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
                <p className="text-dark-400 text-sm">
                  ¿No tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-primary-500 hover:underline font-medium"
                  >
                    Regístrate
                  </button>
                </p>
              </>
            )}
            {mode === 'signup' && (
              <p className="text-dark-400 text-sm">
                ¿Ya tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-primary-500 hover:underline font-medium"
                >
                  Inicia sesión
                </button>
              </p>
            )}
            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-primary-500 hover:underline text-sm font-medium"
              >
                ← Volver a iniciar sesión
              </button>
            )}

            {/* Coquitech branding */}
            <a
              href="https://coquitech.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-dark-500 hover:text-dark-300 transition-colors pt-4"
            >
              <span className="text-[10px]">Powered by</span>
              <span className="text-xs font-semibold text-primary-400">Coquitech AI Agency</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

