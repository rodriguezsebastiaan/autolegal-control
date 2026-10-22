# AUTOLEGAL CONTROL

Plataforma empresarial de ConexaCod para Autolegal destinada a centralizar la flota, sus expedientes documentales, vencimientos y alertas. Toda la interfaz está en español de Colombia y los cálculos diarios usan `America/Bogota`.

## Alcance de esta primera versión

- Autenticación por sesión opaca, contraseña con bcrypt y cookie `httpOnly`.
- Autorización backend para Administrador, Supervisor, Gestor documental y Consulta.
- Aislamiento por organización y modo demostración identificado.
- Dashboard calculado desde PostgreSQL, sin indicadores codificados.
- CRUD de vehículos, desactivación, filtros y paginación del servidor.
- Categorías internas administrables y seis categorías iniciales.
- Propietarios, empresas transportadoras y conductores normalizados.
- Historial de propietario y afiliación empresarial.
- Catálogo y registro documental con verificación, versiones y vigencia calculada.
- Reglas internas de alertas para 60, 30, 20, 17, 10, 5, 3, 1 y 0 días.
- Prevención de eventos duplicados mediante restricción de base de datos.
- Centro de alertas y exportaciones CSV protegidas por sesión.
- Auditoría de accesos y operaciones críticas.
- Correo y almacenamiento privado expresamente desactivados hasta configurar proveedores.

El avance detallado y las siguientes fases están en [docs/ESTADO.md](docs/ESTADO.md).

## Requisitos

- Node.js 22 o superior.
- npm 10 o superior.
- PostgreSQL 16. Docker Compose es opcional; se incluye como método recomendado, pero Docker no viene incluido con este repositorio.

## Instalación local

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Copia `.env.example` como `.env`, define una contraseña PostgreSQL y una contraseña inicial segura. Los valores `CAMBIE_...` no son válidos para el seed.

3. Inicia PostgreSQL. Con Docker:

   ```bash
   docker compose up -d postgres
   ```

   Si se usa el valor local predeterminado de Compose, ajusta `DATABASE_URL` con la misma contraseña. En instalaciones sin Docker, crea la base `autolegal_control` y el usuario correspondiente en PostgreSQL.

4. Aplica el esquema y crea los datos demo:

   ```bash
   npm run db:deploy
   npm run db:seed
   ```

5. Inicia la aplicación:

   ```bash
   npm run dev
   ```

6. Abre `http://localhost:3000`. El usuario es el configurado en `ADMIN_EMAIL` y la contraseña es `ADMIN_INITIAL_PASSWORD`.

## Base de datos

Prisma define el modelo normalizado en `prisma/schema.prisma`. Las migraciones versionadas están en `prisma/migrations`. Los documentos se asocian exactamente a una entidad y las placas activas se protegen con índice parcial, además de validación de aplicación.

Comandos útiles:

```bash
npm run db:generate
npm run db:migrate
npm run db:deploy
npm run db:studio
```

No se versionan bases locales, volcados, archivos privados ni credenciales.

## Motor de alertas

El comando siguiente evalúa documentos verificados y crea eventos internos idempotentes:

```bash
npm run alerts:run
```

En producción deberá ejecutarse diariamente mediante un programador autorizado. No se configura infraestructura externa ni se envían correos en esta entrega. Si se habilita un canal sin proveedor, queda registrado como integración pendiente; nunca como envío exitoso.

## Calidad

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Las pruebas E2E requieren una base preparada y el seed aplicado:

```bash
npx playwright install chromium
npm run test:e2e
```

## Seguridad y datos personales

- No hay registro público ni rutas de expedientes abiertas.
- Todas las consultas operativas se limitan a la organización autenticada.
- Las mutaciones verifican el rol en el servidor.
- Las contraseñas no se guardan en texto plano; los tokens de sesión se guardan como SHA-256.
- El seed rechaza contraseñas de ejemplo o menores de 12 caracteres.
- Los archivos adjuntos no se aceptan hasta configurar almacenamiento privado.
- Antes de usar datos reales deben definirse política de retención, responsables, respaldo cifrado, atención de derechos de titulares y matriz jurídica conforme a la normativa colombiana aplicable.

## Respaldo y despliegue

Consulta [docs/DESPLIEGUE.md](docs/DESPLIEGUE.md). Ningún despliegue ni servicio de pago se crea desde este proyecto.
