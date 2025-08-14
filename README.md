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
 
## API para Aplicación Lechera
Este documento describe los endpoints disponibles en la API del backend para la aplicación de gestión lechera.

### URL Base
Todas las peticiones a la API deben realizarse a la siguiente URL base:

https://dibeltran03.alwaysdata.net/

### Endpoints de la API
A continuación se detallan los endpoints disponibles, los métodos HTTP que aceptan y los datos necesarios para cada petición.

1. Autenticación de Usuarios

URL: `/api/auth/login`

Método: `POST`

Descripción: Valida las credenciales de un usuario contra la base de datos. Si son correctas, devuelve los datos del usuario.

Cuerpo de la Petición (Request Body):

Se debe enviar un objeto JSON con el usuario y la contrasena.

```json
{
    "usuario": "nombre_de_usuario",
    "contrasena": "su_contraseña"
}
```

Respuesta Exitosa (Código 200 OK):

Devuelve un objeto JSON con los datos del usuario autenticado. fkFinca y fkRecolector pueden ser null.

```json
{
    "id": 1,
    "usuario": "nombre_de_usuario",
    "rol": "lechero",
    "fkFinca": null,
    "fkRecolector": 5
}
```

Respuestas de Error:

Código 400 Bad Request: Si no se envían el usuario o la contrasena.

```json
{
    "error": "Usuario y contraseña requeridos"
}
```

Código 401 Unauthorized: Si las credenciales son incorrectas o el usuario está inactivo.

```json
{
    "error": "Credenciales inválidas"
}
```

2. Obtener Listado de Fincas

URL: `/api/fincas?usuarioId={id}`

Método: `GET`

Descripción: Devuelve las fincas activas asociadas al contexto del usuario. Requiere el parámetro de consulta `usuarioId`.

Parámetros de consulta (Query Params):

- `usuarioId` (requerido, entero): ID del usuario solicitante.

Cuerpo de la Petición (Request Body): Ninguno.

Respuesta Exitosa (Código 200 OK):

Devuelve un array de objetos JSON, donde cada objeto representa una finca.

```json
[
    {
        "id": 1,
        "nombreFinca": "La Esperanza",
        "nombres": "Juan",
        "apellidos": "Perez",
        "tipo_documento": "CC",
        "documento": "12345678",
        "fechaNacimiento": "1980-05-15",
        "celular": "3001234567",
        "ubicacion": "Vereda El Carmen",
        "vereda": "El Carmen",
        "observacion": "Finca lechera tradicional."
    },
    {
        "id": 2,
        "nombreFinca": "El Porvenir",
        "nombres": "Ana",
        "apellidos": "Gomez",
        "tipo_documento": "CC",
        "documento": "87654321",
        "fechaNacimiento": "1992-11-20",
        "celular": "3109876543",
        "ubicacion": "Km 5 vía a Neiva",
        "vereda": "Las Palmas",
        "observacion": ""
    }
]
```

3. Sincronizar Registros de Leche

URL: `/api/registros/sync`

Método: `POST`

Descripción: Recibe un array de registros de leche y los inserta en la base de datos. Está diseñado para funcionar de forma masiva y offline.

Cuerpo de la Petición (Request Body):

Se debe enviar un objeto JSON que contenga una clave `registros`, cuyo valor es un array de objetos. Cada objeto representa un registro de leche.

Campos por registro:

- `id` (Opcional, Entero): ID local del registro en el dispositivo. Si se envía, la API lo devolverá para confirmar la sincronización.
- `fkFinca` (Requerido, Entero): ID de la finca donde se hizo la recolección.
- `cantidad` (Requerido, Numérico): Cantidad de leche recolectada (ej. 150.5).
- `fechaHora` (Requerido, String): Fecha y hora de la recolección en formato ISO 8601 (ej. "2024-05-21T10:30:00Z").
- `observaciones` (Opcional, String): Cualquier nota adicional sobre el registro.
- `fkUsuarioRegistra` (Requerido, Entero): ID del usuario que realizó el registro.

```json
{
    "registros": [
        {
            "id": 101,
            "fkFinca": 1,
            "cantidad": 50.5,
            "fechaHora": "2024-05-21T08:00:00Z",
            "observaciones": "Leche de primer ordeño",
            "fkUsuarioRegistra": 3
        },
        {
            "id": 102,
            "fkFinca": 2,
            "cantidad": 120,
            "fechaHora": "2024-05-21T09:15:00Z",
            "fkUsuarioRegistra": 3
        }
    ]
}
```

Respuesta Exitosa (Código 200 OK):

Devuelve un objeto JSON con un array `syncedIds`, que contiene los IDs locales de los registros que se sincronizaron correctamente.

```json
{
    "syncedIds": [101, 102]
}
```

Respuesta de Error (Código 500 Internal Server Error):

Si ocurre un error durante la transacción en la base de datos.

```json
{
    "error": "Error al sincronizar",
    "detail": "Mensaje específico del error de la base de datos."
}
```

4. Listar Registros de Leche por Finca

URL: `/api/registros?fkFinca={id}`

Método: `GET`

Descripción: Obtiene los registros de recolección de leche asociados a una finca específica. Requiere el parámetro de consulta `fkFinca`.

Parámetros de consulta (Query Params):

- `fkFinca` (requerido, entero): ID de la finca de la cual se desean listar los registros.

Cuerpo de la Petición (Request Body): Ninguno.

Respuesta Exitosa (Código 200 OK):

Devuelve un array de objetos JSON, donde cada objeto representa un registro. Incluye el nombre del usuario que registró el dato.

```json
[
  {
    "id": 12,
    "fkFinca": 5,
    "cantidad": 150.5,
    "fechaHora": "2024-05-21T10:30:00Z",
    "observaciones": "Leche de primer ordeño",
    "fkUsuarioRegistra": 3,
    "nombreUsuarioRegistra": "operario01"
  },
  {
    "id": 11,
    "fkFinca": 5,
    "cantidad": 98.0,
    "fechaHora": "2024-05-20T09:10:00Z",
    "observaciones": "",
    "fkUsuarioRegistra": 3,
    "nombreUsuarioRegistra": "operario01"
  }
]
```

Respuestas de Error:

Código 400 Bad Request: Si no se envía `fkFinca` o no es válido.

```json
{
  "error": "Se requiere el ID de la finca (fkFinca)"
}
```

## Licencia
Este proyecto está bajo la licencia MIT. Ver `LICENSE`.
