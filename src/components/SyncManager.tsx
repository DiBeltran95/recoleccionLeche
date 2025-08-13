import React, { useEffect, useState } from 'react';
import { SyncService } from '../services/sync';
import { StorageService } from '../services/storage';

interface SyncManagerProps {
  isOnline: boolean;
  showNotification: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export const SyncManager: React.FC<SyncManagerProps> = ({ isOnline, showNotification }) => {
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (isOnline && !isSyncing) {
      syncPendingRecords();
    }
  }, [isOnline]);

  const syncPendingRecords = async () => {
    const pendingRecords = StorageService.getPendingRegistros();
    
    if (pendingRecords.length === 0) {
      return;
    }

    setIsSyncing(true);
    showNotification(`Sincronizando ${pendingRecords.length} registros...`, 'info');

    try {
      const result = await SyncService.syncPendingRecords();
      
      if (result.success) {
        showNotification(
          `¡Sincronización exitosa! ${result.syncedCount} registros enviados`,
          'success'
        );
      } else {
        showNotification(`Error en sincronización: ${result.error}`, 'error');
      }
    } catch (error) {
      showNotification('Error de conexión durante la sincronización', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  return null; // Este componente no renderiza nada, solo maneja la sincronización
};