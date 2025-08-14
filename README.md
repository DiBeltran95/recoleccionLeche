# Recolección de Leche

![CI](https://github.com/DiBeltran95/recoleccionLeche/actions/workflows/ci.yml/badge.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-339933?logo=node.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-%5E5.4-646CFF?logo=vite&logoColor=white)
![Licencia](https://img.shields.io/badge/Licencia-MIT-blue)

Aplicación web para registrar la recolección de leche en fincas con soporte offline y sincronización cuando vuelve la conexión.

## Tecnologías
- Frontend: Vite + React + TypeScript + TailwindCSS
- Backend: Node/Express en TypeScript
- Almacenamiento local: IndexedDB/localStorage (servicios en `src/services`)

## Funcionalidades
- Autenticación básica
- Selección de finca
- Registro de recolecciones
- Notificaciones de estado
- Modo offline y sincronización diferida

## Instalación
Requisitos:
- Node.js >= 18
- npm >= 9

Pasos:
1) Clonar el repositorio
   ```bash
   git clone https://github.com/DiBeltran95/recoleccionLeche.git
   cd recoleccionLeche
   ```
2) Instalar dependencias
   ```bash
   npm ci
   npm install
   ```
3) Configurar variables de entorno (ver sección siguiente)
4) Levantar entorno de desarrollo (frontend y backend en paralelo)
   ```bash
   npm run dev
   npm run dev:server
   ```

## Configuración .env
Crear un archivo `.env` en la raíz del proyecto con las siguientes variables (ejemplo para MySQL):
```
# Servidor
PORT=3001

# Base de datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=usuario
DB_PASSWORD=contraseña
DB_NAME=recoleccion_leche
```

## Estructura
- `src/`: aplicación frontend
- `server/`: API en Express

## Roadmap
- [ ] Autenticación con sesiones/JWT y roles
- [ ] CRUD completo de fincas y registros con validaciones
- [ ] Sincronización automática cuando vuelve la conexión
- [ ] Tests (unitarios e integración)
- [ ] Despliegue y CI/CD

##Mysql
   ```bash
   CREATE TABLE recolector (
       id INT AUTO_INCREMENT PRIMARY KEY,
       nombres VARCHAR(100) NOT NULL,
       apellidos VARCHAR(100) NOT NULL,
       tipo_documento ENUM('CC', 'CE', 'NIT', 'Otro') NOT NULL,
       documento VARCHAR(20) NOT NULL UNIQUE,
       fechaNacimiento DATE,
       celular VARCHAR(20),
       direccion VARCHAR(255),
       placaVehiculo VARCHAR(20),
       datos_bancarios TEXT,
       estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo'
   );
   
   CREATE TABLE finca (
       id INT AUTO_INCREMENT PRIMARY KEY,
       nombreFinca VARCHAR(255),
       nombres VARCHAR(100) NOT NULL,
       apellidos VARCHAR(100) NOT NULL,
       tipo_documento ENUM('CC', 'CE', 'NIT', 'Otro') NOT NULL,
       documento VARCHAR(20) NOT NULL UNIQUE,
       fechaNacimiento DATE,
       celular VARCHAR(20),
       ubicacion VARCHAR(255),
       vereda VARCHAR(255),
       observacion VARCHAR(255),
       estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo'
   );
   
   CREATE TABLE usuario (
       id INT AUTO_INCREMENT PRIMARY KEY,
       usuario VARCHAR(50) NOT NULL UNIQUE,
       contrasena VARCHAR(255) NOT NULL,
       rol ENUM('propietario', 'lechero') NOT NULL,
       fkRecolector INT NULL,
       fkFinca INT NULL,
       estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
       CONSTRAINT fk_usuario_recolector FOREIGN KEY (fkRecolector) REFERENCES recolector(id) ON DELETE SET NULL,
       CONSTRAINT fk_usuario_finca FOREIGN KEY (fkFinca) REFERENCES finca(id) ON DELETE SET NULL
   );
   
   CREATE TABLE registro_leche (
       id INT AUTO_INCREMENT PRIMARY KEY,
       fkFinca INT NOT NULL,
       cantidad DECIMAL(10, 2) NOT NULL,
       fechaHora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       observaciones TEXT,
       fkUsuarioRegistra INT NOT NULL,
       CONSTRAINT fk_registro_finca FOREIGN KEY (fkFinca) REFERENCES finca(id),
       CONSTRAINT fk_registro_usuario FOREIGN KEY (fkUsuarioRegistra) REFERENCES usuario(id)
   );

   CREATE TABLE ruta (
       id INT AUTO_INCREMENT PRIMARY KEY,
       nombre VARCHAR(255) NOT NULL,
       descripcion TEXT,
       fkRecolector INT NULL,
       estado ENUM('activa', 'inactiva') NOT NULL DEFAULT 'activa',
       CONSTRAINT fk_ruta_recolector FOREIGN KEY (fkRecolector) REFERENCES recolector(id) ON DELETE SET NULL
   );
   
   CREATE TABLE ruta_finca (
       id INT AUTO_INCREMENT PRIMARY KEY,
       fkRuta INT NOT NULL,
       fkFinca INT NOT NULL,
       orden_visita INT NOT NULL COMMENT 'Define la secuencia de visita (1, 2, 3, ...)',
       CONSTRAINT fk_rutafinca_ruta FOREIGN KEY (fkRuta) REFERENCES ruta(id) ON DELETE CASCADE,
       CONSTRAINT fk_rutafinca_finca FOREIGN KEY (fkFinca) REFERENCES finca(id) ON DELETE CASCADE,
       UNIQUE (fkRuta, fkFinca)
   );
   ```

## Deploy
Se versiona en GitHub: https://github.com/DiBeltran95/recoleccionLeche

## Licencia
Este proyecto está bajo la licencia MIT. Ver `LICENSE`.
