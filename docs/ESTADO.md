# Estado funcional

## Implementado en la versión inicial

- Arquitectura, navegación responsive, diseño general y PostgreSQL/Prisma.
- Sesiones seguras, roles y aislamiento organizacional.
- Dashboard con métricas y gráficos calculados.
- Categorías administrables.
- Propietarios, empresas y conductores: alta y consulta.
- Vehículos: alta, consulta, edición, desactivación, filtros e historial de titular/afiliación.
- Documentos: alta, catálogo, verificación, primera versión inmutable y cálculo de vigencia.
- Reglas y eventos internos de alertas idempotentes.
- Centro de alertas, revisión de eventos y CSV de vehículos/documentos.
- Auditoría inicial y modo demo con datos ficticios identificados.

## Preparado pero pendiente de ampliar

- Edición completa de propietarios, empresas y conductores; asignación histórica de conductores.
- Matriz de aplicabilidad y editor visual de reglas.
- Flujo completo de renovaciones, comentarios, soportes y cierre autorizado.
- Carga privada de PDF/imágenes y análisis de archivos.
- Proveedor de correo y reintentos externos.
- Importación CSV/XLSX con mapeo y vista previa.
- Calendario, Excel, PDF e informes avanzados.
- Gestión visual de usuarios, permisos granulares y recuperación de contraseña.
- Pruebas funcionales completas con infraestructura PostgreSQL en CI.
- WhatsApp Business queda expresamente fuera de esta primera etapa.

## Restricciones conocidas

El entorno local actual debe aportar PostgreSQL o Docker. Sin una base disponible se pueden verificar tipado, lint, pruebas unitarias y compilación, pero no el flujo E2E autenticado.
