# Catálogo del Taller

Aplicación web con **login** y **catálogo de piezas** (familias, descripción, precio e imágenes múltiples). Permite dar de alta piezas desde el navegador y, en móvil (Android/iPhone), añadir fotos desde **cámara** o **galería**.

## Ejecutar en local (Windows)

En `web/`:

```bash
npm install
npx prisma migrate dev
npm run dev
```

Abre `http://localhost:3000`.

- **Primer arranque**: entra en `/setup` para crear el usuario administrador.
- Luego inicia sesión en `/login`.

## Datos

- **Base de datos**: SQLite (por defecto `web/dev.db` en desarrollo).
- **Imágenes**: se guardan en `web/public/uploads` (URLs como `/uploads/...`).

## Despliegue en servidor (Docker)

Requisitos: Docker Desktop instalado.

En la raíz del proyecto:

```bash
docker compose up -d --build
```

Abre `http://TU_SERVIDOR:3000`.

Persistencia:
- **BD**: carpeta `./data` (montada en `/data`).
- **Imágenes**: carpeta `./uploads` (montada en `/app/public/uploads`).

### Importante (producción)

- Cambia `NEXTAUTH_SECRET` en `docker-compose.yml`.
- Ajusta `NEXTAUTH_URL` a tu dominio (por ejemplo `https://catalogo.midominio.com`).

