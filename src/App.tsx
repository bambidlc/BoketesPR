import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BottomNav } from './components/layout';
import { ToastContainer } from './components/ui';
import { SignInPrompt } from './components/auth';
import { MapPage, ListPage, ReportPage, DetailPage, ProfilePage, AuthPage, LeaderboardPage } from './pages';
import { useStore } from './store/useStore';
import { initAnalytics } from './lib/firebase';

function App() {
  const { toasts, removeToast, isSignInPromptOpen, signInPromptMessage, closeSignInPrompt } = useStore();

  // Initialize analytics on mount
  useEffect(() => {
    initAnalytics();
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-dark-950 text-white">
        {/* Routes */}
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/list" element={<ListPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/pothole/:id" element={<DetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
        </Routes>

        {/* Bottom navigation */}
        <BottomNav />

        {/* Sign-in prompt modal */}
        <SignInPrompt
          isOpen={isSignInPromptOpen}
          onClose={closeSignInPrompt}
          message={signInPromptMessage}
        />

        {/* Toast notifications */}
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </div>
    </BrowserRouter>
  );
}

export default App;

