import { useState, useEffect } from 'react';
import { SyncService } from '../services/sync';

export const useConnectivity = () => {
  const [isOnline, setIsOnline] = useState(SyncService.isOnline());

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};