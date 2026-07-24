import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Users } from 'lucide-react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard/Dashboard';
import AddPatient from './pages/AddPatient';
import AddAppointment from './pages/AddAppointment';
import UserManagement from './pages/Dashboard/UserManagement';
import NotificationHistory from './pages/Dashboard/NotificationHistory';
import NotificationSettings from './pages/Dashboard/NotificationSettings';
import Login from './pages/Login';
import FloatingActionButton from './components/FloatingActionButton';

function AppContent() {
  const { user, loading, isSuperAdmin } = useAuth();
  const { isDark } = useTheme();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const isAdminOrSuperAdmin = isSuperAdmin || user?.role === 'admin';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'add-patient':
        return <AddPatient />;
      case 'add-appointment':
        return isAdminOrSuperAdmin ? <AddAppointment /> : <Dashboard />;
      case 'notification-history':
        return isAdminOrSuperAdmin ? <NotificationHistory isDark={isDark} /> : <Dashboard />;
      case 'notification-settings':
        return isAdminOrSuperAdmin ? <NotificationSettings isDark={isDark} /> : <Dashboard />;
      case 'user-management':
        return isSuperAdmin ? <UserManagement isDark={isDark} /> : <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-300">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Action Button - Only show on dashboard */}
      {currentPage === 'dashboard' && (
        <FloatingActionButton 
          onClick={() => setCurrentPage('add-patient')}
          icon={Users}
          tooltip="Add Patient"
        />
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--toast-bg, #fff)',
              color: 'var(--toast-color, #363636)',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
