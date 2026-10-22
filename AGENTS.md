# Instrucciones para agentes Codex

## Contexto invariable

- Producto: AUTOLEGAL CONTROL, una solución de ConexaCod para Autolegal.
- Interfaz: español de Colombia; fechas visibles `DD/MM/AAAA`; zona `America/Bogota`; moneda COP.
- Stack: Next.js App Router, TypeScript estricto, Tailwind, Prisma y PostgreSQL.
- Nunca inventar obligaciones legales. Toda aplicabilidad documental debe ser configurable y lo no validado debe indicarse como pendiente.
- `Kias` es una categoría interna, no una modalidad jurídica.
- Vigencia documental, verificación administrativa y estado del trámite son conceptos independientes.

## Arquitectura

- Páginas y rutas: `src/app`.
- Componentes reutilizables: `src/components`.
- Dominio, autenticación y persistencia: `src/lib`.
- Mutaciones: acciones de servidor en `src/app/actions`; toda mutación debe validar Zod, organización y rol.
- Base de datos: `prisma/schema.prisma` y migraciones versionadas.
- Pruebas unitarias junto al código `*.test.ts`; E2E en `tests/e2e`.

## Reglas de cambio

- Mantener TypeScript estricto y ejecutar `npm run typecheck`, `npm run lint`, `npm test` y `npm run build`.
- No acceder a registros únicamente por `id`: añadir siempre `organizationId` derivado de la sesión.
- No confiar en permisos visuales. Verificar roles en el servidor.
- No almacenar secretos, adjuntos, datos reales, volcados ni bases locales en Git.
- Toda renovación debe crear una nueva `DocumentVersion`; nunca reescribir el historial.
- Los envíos externos permanecen desactivados salvo autorización explícita y proveedor configurado.
- Las alertas deben ser idempotentes y conservar el registro de intentos.
- Agregar migración e índice cuando se modifique el esquema.

## Definición de terminado

Una función no está terminada hasta que tenga validación del servidor, autorización, aislamiento por organización, estado vacío/error y prueba proporcional al riesgo. Actualiza `docs/ESTADO.md` al cerrar cada módulo.
