// Servicio para manejo de almacenamiento local
const STORAGE_KEYS = {
  USER: 'milk_app_user',
  FINCAS: 'milk_app_fincas',
  REGISTROS: 'milk_app_registros',
  LAST_SYNC: 'milk_app_last_sync',
};

export class StorageService {
  // Usuario logueado
  static saveUser(user: any) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  static getUser() {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  }

  static clearUser() {
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  // Fincas
  static saveFincas(fincas: any[]) {
    localStorage.setItem(STORAGE_KEYS.FINCAS, JSON.stringify(fincas));
  }

  static getFincas() {
    const fincas = localStorage.getItem(STORAGE_KEYS.FINCAS);
    return fincas ? JSON.parse(fincas) : [];
  }

  // Registros de leche
  static saveRegistro(registro: any) {
    const registros = this.getRegistros();
    const newRegistro = {
      ...registro,
      id: Date.now(), // ID temporal
      synced: false,
    };
    registros.push(newRegistro);
    localStorage.setItem(STORAGE_KEYS.REGISTROS, JSON.stringify(registros));
    return newRegistro;
  }

  static getRegistros() {
    const registros = localStorage.getItem(STORAGE_KEYS.REGISTROS);
    return registros ? JSON.parse(registros) : [];
  }

  static markRegistrosAsSynced(syncedIds: number[]) {
    const registros = this.getRegistros();
    const updatedRegistros = registros.map((registro: any) => 
      syncedIds.includes(registro.id) 
        ? { ...registro, synced: true }
        : registro
    );
    localStorage.setItem(STORAGE_KEYS.REGISTROS, JSON.stringify(updatedRegistros));
  }

  static getPendingRegistros() {
    return this.getRegistros().filter((registro: any) => !registro.synced);
  }

  // Última sincronización
  static setLastSync(timestamp: string) {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp);
  }

  static getLastSync() {
    return localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  }
}