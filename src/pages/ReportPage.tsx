import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout';
import { ReportForm } from '../components/pothole';
import { useAuth } from '../hooks';

export default function ReportPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  // Redirect to login if not authenticated
  if (!loading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col">
        <Header title="Reportar Bokete" showBack />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-6 max-w-sm">
            <div className="text-6xl">🔐</div>
            <div className="space-y-2">
              <h2 className="text-xl font-display font-semibold text-white">
                Inicia sesión para reportar
              </h2>
                <p className="text-dark-400 text-sm">
                  Necesitas una cuenta para reportar boketes y ayudar a la comunidad.
                </p>
            </div>
            <button
              onClick={() => navigate('/auth')}
              className="w-full py-3 px-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
            >
              Iniciar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      <Header title="Reportar Bache" showBack />
      <div className="flex-1 pt-14">
        <ReportForm
          onSuccess={() => navigate('/')}
          onCancel={() => navigate(-1)}
        />
      </div>
    </div>
  );
}

