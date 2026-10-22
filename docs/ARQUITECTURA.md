# Arquitectura

AUTOLEGAL CONTROL usa una arquitectura modular sobre Next.js App Router. La interfaz y las acciones de servidor conviven en la misma aplicación, mientras Prisma concentra el acceso tipado a PostgreSQL.

## Capas

1. **Presentación:** layouts protegidos, componentes responsivos y formularios progresivos.
2. **Aplicación:** acciones de servidor con Zod, control de rol, alcance de organización y auditoría.
3. **Dominio:** cálculo puro de fechas y vigencias, reglas de alertas e idempotencia.
4. **Persistencia:** modelo relacional Prisma, restricciones SQL e historial de versiones.
5. **Integraciones:** adaptadores futuros para almacenamiento privado y correo; desactivados por defecto.

## Decisiones relevantes

- **Multiempresa desde el inicio:** cada dato operativo lleva `organization_id`. Permite aislar demostración y producción sin mezclar registros.
- **Sesiones opacas:** el navegador recibe un token aleatorio y PostgreSQL conserva únicamente su hash.
- **Vigencia calculada:** no se guarda un estado que pueda quedar obsoleto de un día a otro; se deriva de vencimiento, verificación y fecha local de Bogotá.
- **Historial inmutable:** `document_versions` conserva cada vigencia. El documento principal representa la versión operativa actual.
- **Alertas idempotentes:** la combinación documento, regla y fecha de disparo es única.
- **Placas:** normalización de aplicación y un índice SQL parcial impiden duplicados entre vehículos no inactivos.

## Flujo principal

Usuario autenticado → acción validada → comprobación de rol y organización → transacción Prisma → auditoría → revalidación de vistas.
