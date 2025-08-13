import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { FarmSelection } from './components/FarmSelection';
import { MilkRegistration } from './components/MilkRegistration';
import { SyncManager } from './components/SyncManager';
import { Notification } from './components/Notification';
import { StorageService } from './services/storage';
import { useConnectivity } from './hooks/useConnectivity';
import { AppState, Finca } from './types';
import { LogOut, Wifi, WifiOff } from 'lucide-react';

function App() {
  const [appState, setAppState] = useState<AppState>({
    isLoggedIn: false,
    currentUser: null,
    selectedFarm: null,
    currentView: 'login'
  });

  const [notifications, setNotifications] = useState<Array<{
    id: number;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>>([]);

  const isOnline = useConnectivity();

  useEffect(() => {
    // Verificar si hay un usuario logueado al cargar la app
    const savedUser = StorageService.getUser();
    if (savedUser) {
      setAppState(prev => ({
        ...prev,
        isLoggedIn: true,
        currentUser: savedUser,
        currentView: 'farmSelection'
      }));
    }
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleLogin = (user: any) => {
    setAppState(prev => ({
      ...prev,
      isLoggedIn: true,
      currentUser: user,
      currentView: 'farmSelection'
    }));
  };

  const handleFarmSelect = (farm: Finca) => {
    setAppState(prev => ({
      ...prev,
      selectedFarm: farm,
      currentView: 'milkRegistration'
    }));
  };

  const handleBackToFarmSelection = () => {
    setAppState(prev => ({
      ...prev,
      selectedFarm: null,
      currentView: 'farmSelection'
    }));
  };

  const handleLogout = () => {
    StorageService.clearUser();
    setAppState({
      isLoggedIn: false,
      currentUser: null,
      selectedFarm: null,
      currentView: 'login'
    });
    showNotification('Sesión cerrada correctamente', 'info');
  };

  const renderCurrentView = () => {
    switch (appState.currentView) {
      case 'login':
        return (
          <Login 
            onLogin={handleLogin} 
            showNotification={showNotification}
          />
        );
      
      case 'farmSelection':
        return (
          <FarmSelection
            currentUser={appState.currentUser}
            onFarmSelect={handleFarmSelect}
            showNotification={showNotification}
            isOnline={isOnline}
          />
        );
      
      case 'milkRegistration':
        return (
          <MilkRegistration
            currentUser={appState.currentUser}
            selectedFarm={appState.selectedFarm!}
            onBack={handleBackToFarmSelection}
            showNotification={showNotification}
            isOnline={isOnline}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con estado de conexión y logout */}
      {appState.isLoggedIn && (
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-2xl mx-auto px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-xs font-medium ${
                isOnline ? 'text-green-600' : 'text-red-600'
              }`}>
                {isOnline ? 'En línea' : 'Sin conexión'}
              </span>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-3 h-3" />
              Salir
            </button>
          </div>
        </div>
      )}

      {/* Vista actual */}
      {renderCurrentView()}

      {/* Gestor de sincronización */}
      <SyncManager 
        isOnline={isOnline}
        showNotification={showNotification}
      />

      {/* Notificaciones */}
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

export default App;