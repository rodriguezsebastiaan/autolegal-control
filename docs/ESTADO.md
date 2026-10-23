# Estado funcional

## Implementado y verificado sin base de datos

- Arquitectura, diseño general, TypeScript, Prisma/PostgreSQL y compilación de producción.
- Autenticación por organización, roles y aislamiento organizacional reforzado en código.
- Fechas civiles sin desplazamiento UTC/Bogotá, con regresiones de mes, año y año bisiesto.
- Separación de funciones documental: versión pendiente, revisión por otro usuario autorizado, rechazo motivado y auditoría.
- Alertas con fecha lógica, recuperación configurable, trazabilidad, restricción idempotente y bloqueo concurrente diseñado para PostgreSQL.
- Panel local de evaluación separado, sin PostgreSQL, con dashboard, flota, cinco categorías, documentos, alertas, renovaciones, propietarios, conductores, reportes y configuración.
- Navegación responsive con menú móvil y datos de prueba persistidos únicamente en `localStorage`.
- Registro local de vehículo con primer documento y fechas; nuevos documentos desde la ficha por placa.
- Estado operativo manual por vehículo (`Activo`, `Mantenimiento` o `Inactivo`), con motivo y fecha de actualización; filtro por estado y resumen de flota. Los inactivos conservan su historial, pero se excluyen de las alertas operativas.
- Filtros de vehículos, documentos, alertas, renovaciones, propietarios y conductores.
- Alertas calculadas por días restantes y selector interactivo de fecha de análisis.
- Renovación local en dos etapas: registro pendiente, revisión por una persona diferente y activación de la nueva vigencia. Al aprobar, la versión anterior queda histórica, deja de generar alertas y el conteo comienza desde el nuevo vencimiento.
- CRUD local de propietarios y alta/edición de conductores y licencias para validación de experiencia.

## Implementado pero pendiente de prueba integral

- Sesiones, login y permisos con usuarios persistidos.
- Dashboard con métricas y gráficos calculados.
- Categorías administrables.
- Propietarios, empresas y conductores: alta y consulta.
- Vehículos: alta, consulta, edición, desactivación, filtros e historial de titular/afiliación.
- Documentos: alta, propuesta de actualización, revisión/rechazo, historial de versiones y cálculo de vigencia.
- Reglas y eventos internos de alertas con recuperación.
- Centro de alertas, revisión de eventos y CSV de vehículos/documentos.
- Auditoría inicial y seed operativo con datos ficticios identificados.

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
- Navegación móvil completa y revisión responsive de páginas protegidas.
- WhatsApp Business queda expresamente fuera de esta primera etapa.

## Restricciones conocidas

Las migraciones nuevas no se han ejecutado por instrucción. Sin una base PostgreSQL/Supabase aislada se pueden verificar esquema, tipado, lint, pruebas unitarias y compilación, pero no el flujo E2E autenticado, la atomicidad transaccional, las restricciones ni la concurrencia real del motor de alertas.
