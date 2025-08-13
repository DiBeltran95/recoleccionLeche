// Tipos de datos para la aplicación
export interface User {
  id: number;
  usuario: string;
  contrasena: string;
}

export interface Finca {
  id: number;
  nombre: string;
}

export interface RegistroLeche {
  id?: number;
  fkFinca: number;
  cantidad: number;
  saldo: number;
  fechaHora: string;
  fkUsuario: number;
  synced?: boolean;
}

export interface AppState {
  isLoggedIn: boolean;
  currentUser: User | null;
  selectedFarm: Finca | null;
  currentView: 'login' | 'farmSelection' | 'milkRegistration';
}

export interface SyncStatus {
  isOnline: boolean;
  pendingRecords: number;
  lastSync: string | null;
}