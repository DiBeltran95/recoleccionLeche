# Recolección de Leche

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

## Desarrollo local
1. Instalar dependencias
   ```bash
   npm install
   ```
2. Ejecutar el frontend en modo desarrollo
   ```bash
   npm run dev
   ```
3. Ejecutar el servidor (en otra terminal)
   ```bash
   npm run server
   ```

Ajusta los comandos según los scripts definidos en `package.json`.

## Estructura
- `src/`: aplicación frontend
- `server/`: API en Express

## Deploy
Se versiona en GitHub: https://github.com/DiBeltran95/recoleccionLeche

## Licencia
Este proyecto está bajo la licencia MIT. Ver `LICENSE`.
