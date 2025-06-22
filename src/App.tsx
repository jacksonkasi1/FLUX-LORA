import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// ** import third party
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ** import shared components
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

// ** import components
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// ** import pages
import Index from './pages/Index';
import { AuthPage } from './pages/AuthPage';
import { SignupPage } from './pages/SignupPage';
import { ProfilePage } from './components/pages/ProfilePage';
import { SettingsPage } from './components/pages/SettingsPage';
import { TrainPage } from './components/pages/TrainPage';
import NotFound from './pages/NotFound';

// ** import contexts
import { AuthProvider } from '@/contexts/AuthContext';

// Constants
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/signup" element={<SignupPage />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />
            <Route path="/train" element={
              <ProtectedRoute>
                <TrainPage />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
