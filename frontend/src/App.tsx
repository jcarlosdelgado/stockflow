import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { CommandPalette } from './components/Common/CommandPalette';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { Login } from './pages/Login';
import { Products } from './pages/Products';
import { Purchases } from './pages/Purchases';
import { Sales } from './pages/Sales';
import { Users } from './pages/Users';
import { Warehouses } from './pages/Warehouses';

const MainLayout: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        color: 'var(--text-secondary)'
      }}>
        Iniciando StockFlow...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'products':
        return <Products />;
      case 'warehouses':
        return <Warehouses />;
      case 'inventory':
        return <Inventory />;
      case 'sales':
        return <Sales />;
      case 'purchases':
        return <Purchases />;
      case 'users':
        return <Users />;
      default:
        return <Dashboard onNavigate={(tab) => setCurrentTab(tab)} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />
      <div className="main-content">
        <Header
          currentTab={currentTab}
          onOpenCommand={() => setIsCommandOpen(true)}
        />
        <main>{renderContent()}</main>
      </div>

      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onNavigate={(view) => setCurrentTab(view)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainLayout />
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
