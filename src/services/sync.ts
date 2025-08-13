import { StorageService } from './storage';
import { ApiService } from './api';

// Simulación de API - En producción sería tu backend real

export class SyncService {
  // Simular verificación de usuario
  static async authenticateUser(usuario: string, contrasena: string) {
    try {
      const response = await ApiService.login(usuario, contrasena);
      return response.success ? response.user : null;
    } catch (error) {
      console.error('Error en autenticación:', error);
      return null;
    }
  }

  // Obtener fincas del servidor
  static async fetchFincas() {
    try {
      const response = await ApiService.getFincas();
      return response.success ? response.fincas : [];
    } catch (error) {
      console.error('Error obteniendo fincas:', error);
      return [];
    }
  }

  // Sincronizar registros pendientes
  static async syncPendingRecords() {
    const pendingRecords = StorageService.getPendingRegistros();
    
    if (pendingRecords.length === 0) {
      return { success: true, syncedCount: 0 };
    }

    try {
      // Preparar registros para sincronización
      const registrosParaSync = pendingRecords.map(record => ({
        ...record,
        tempId: record.id, // Guardar ID temporal para referencia
      }));

      const response = await ApiService.syncRegistros(registrosParaSync);
      
      if (response.success) {
        // Marcar registros como sincronizados
        const syncedIds = response.syncedIds.map((item: any) => item.tempId);
        StorageService.markRegistrosAsSynced(syncedIds);
        StorageService.setLastSync(new Date().toISOString());
        
        return { success: true, syncedCount: syncedIds.length };
      } else {
        return { success: false, error: response.message || 'Error desconocido' };
      }
      
    } catch (error) {
      console.error('Error sincronizando:', error);
      return { success: false, error: 'Error de conexión con el servidor' };
    }
  }

  // Verificar conectividad
  static isOnline() {
    return navigator.onLine;
  }

  // Verificar conectividad con el servidor
  static async checkServerConnection() {
    try {
      await ApiService.healthCheck();
      return true;
    } catch (error) {
      return false;
    }
  }
}