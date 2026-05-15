# Guía de despliegue en Coolify

## Estado actual

Este repositorio ya no usa Dockerfile. El despliegue correcto es con **Nixpacks** y un servidor estático persistente.

La app compila con `npm run build` y el runtime debe servir el frontend compilado desde `dist/client`.
El `start` del repo ahora lanza `serve dist/client` para que el contenedor permanezca vivo.

## Configuración recomendada en Coolify

1. Usa **Build Pack: Nixpacks**.
2. Deja **Is it a static site? = No** y **Is it a SPA? = No**.
3. Deja **Publish Directory** vacío.
4. No uses configuración custom de Nginx/Caddy en Coolify.
5. En Domains, pon solo hostnames (sin protocolo ni slash final): `mhadle.kaizenith.es`.
6. Si quieres varios dominios, añádelos como entradas separadas en la UI.
7. El runtime debe escuchar en el puerto que Coolify inyecte en `PORT`; en este repo queda forzado a `80` para Coolify y `3000` como valor local por defecto.

## Qué hace este repo

- `package.json` compila con `vite build`.
- `package.json` expone `start` como servidor estático persistente sobre `dist/client`.
- `nixpacks.toml` deja explícito el directorio cliente y el `PORT` para el runtime.

## Variables de entorno

Las variables `VITE_*` deben seguir configurándose en Coolify antes del deploy para que queden embebidas en build time.

No definas secretos de servidor en frontend. `SUPABASE_SERVICE_ROLE_KEY` no debe inyectarse en builds cliente.

## Validación local

Antes de redeployar, el proyecto debe seguir compilando con:

```bash
npm run build
```

Si el recurso actual sigue en bucle de reinicios, crea un recurso nuevo en Coolify con Nixpacks y elimina el anterior para que no arrastre la configuración vieja.

## Diagnóstico rápido de 404 en este setup

Si aparece 404 después de compilar bien:

1. Revisa que en logs de plan aparezca `serve dist/client` como start command.
2. Revisa que `COOLIFY_FQDN` no tenga valores corruptos como `https`.
3. Revisa que el puerto interno del contenedor coincida con `PORT` y con el puerto expuesto en Coolify.
4. Haz redeploy con cache limpio.
