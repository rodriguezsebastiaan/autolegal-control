# Auditoría técnica y funcional de AUTOLEGAL CONTROL

**Fecha:** 22 de octubre de 2026

**Alcance:** versión inicial de `main` y correcciones acumuladas en `fix/p0-seguridad-fechas-auth`

**Condición de la auditoría:** sin conexión a base de datos, sin migraciones, sin seed, sin ejecutar `scripts/setup-local-windows.ps1` y sin conectar Supabase.

> **Actualización del 22 de octubre de 2026 — rama `fix/p0-seguridad-fechas-auth`:** los hallazgos P0-01 a P0-05 fueron corregidos en código y cuentan con pruebas unitarias de regresión. Las migraciones no se aplicaron y las garantías que dependen de PostgreSQL (transacciones, restricciones, concurrencia e integración) continúan pendientes de validación real.

## 1. Conclusión ejecutiva

AUTOLEGAL CONTROL tiene una base técnica coherente para continuar: Next.js App Router, TypeScript, Prisma sobre PostgreSQL, validaciones Zod, sesiones opacas, separación por organización en gran parte de las consultas, modelo relacional amplio, interfaz visual consistente y pruebas unitarias para una parte del dominio. El proyecto pasa tipado, lint, pruebas unitarias, validación del esquema Prisma y compilación de producción.

Sin embargo, **todavía no está listo para presentarse como una solución funcional de extremo a extremo**. No se ha podido validar ningún flujo persistente ni autenticado sin una base de datos, y la revisión de código encontró bloqueadores de seguridad y exactitud que deben corregirse antes de una demostración con datos:

1. La edición de vehículos permitía referencias de otra organización; está corregida y probada en unidad, pendiente de prueba con BD.
2. Las fechas PostgreSQL `DATE` se mostraban un día antes; está corregido y probado en unidad, pendiente de round-trip con BD.
3. El login elegía ambiguamente cuando un correo existía en varias organizaciones; ahora exige un código de organización, pendiente de prueba integral.
4. El flujo documental inseguro fue reemplazado por versiones pendientes y revisión obligatoria por un usuario autorizado distinto; falta validarlo con PostgreSQL.
5. El motor de alertas ahora recupera ejecuciones omitidas dentro de una ventana configurable, excluye vehículos inactivos y registra cada decisión; la concurrencia e idempotencia persistente requieren PostgreSQL.
6. Renovaciones, almacenamiento privado, matriz de aplicabilidad y varios CRUD están modelados, pero no implementados funcionalmente.

**Dictamen:** base de producto prometedora, pero estado actual de **prototipo funcional parcial**. Antes de mostrarlo a Autolegal se deben cerrar los problemas P0/P1, conectar un entorno de pruebas PostgreSQL/Supabase controlado y ejecutar pruebas integrales con datos.

## 2. Método y evidencia

Se revisaron todos los archivos fuente de `src/`, el esquema y la migración inicial de Prisma, el seed, scripts, configuración, documentación y pruebas existentes. También se enumeraron las rutas generadas por la compilación y se inspeccionó visualmente la pantalla de acceso en navegador de escritorio.

### Comprobaciones ejecutadas sin servicios externos

| Comprobación | Resultado | Alcance real |
|---|---|---|
| `npm run typecheck` | Correcto | Tipos TypeScript del proyecto |
| `npm run lint` | Correcto | Reglas ESLint configuradas |
| `npm test` | Correcto: 80 pruebas, 9 archivos | Incluye regresiones de tenant, separación de funciones, acciones documentales, recuperación de alertas, autenticación multiempresa y fechas civiles |
| `npx prisma validate` con URL ficticia | Correcto | Sintaxis y relaciones del esquema; no valida la migración contra una BD |
| `npm run build` con URL ficticia | Correcto | Compilación de producción: 18 rutas de la aplicación más la ruta automática de no encontrado |
| Render de `/login` en navegador | Correcto en escritorio | Presentación y árbol accesible básico; no autenticación |
| Playwright `tests/e2e/login.spec.ts` | No concluyente | Se reintentó sobre un build que respondió HTTP 200 en `/login`, pero el runner no produjo resultado y fue detenido. No se declara aprobado |
| Regresiones de fechas civiles | Correcto | Conservan el día exacto, incluidos límites de mes/año y febrero bisiesto |

No se ejecutaron `db:migrate`, `db:deploy`, `db:seed`, `alerts:run`, Docker, PostgreSQL local ni el script de configuración de Windows.

### Limitación principal

La compilación correcta demuestra que las rutas pueden generarse, no que sus consultas, permisos, transacciones o cálculos con datos reales funcionen. Todas las páginas protegidas dependen de sesión y PostgreSQL; por tanto, no fueron probadas integralmente.

## 3. Estado general por módulo

Las clasificaciones se usan de forma estricta: “probado” significa que se ejecutó una prueba pertinente en esta auditoría, no solo que el código compila.

| Módulo | Clasificación | Evidencia y observaciones |
|---|---|---|
| Estructura Next.js, tipado y compilación | **Implementado y probado** | Typecheck, lint y build correctos. |
| Esquema Prisma | **Implementado, pero sin prueba integral** | `prisma validate` correcto; migración no aplicada por instrucción. |
| Pantalla de acceso | **Implementado, pero sin prueba integral** | Render visual correcto; autenticación real no probada. |
| Autenticación y sesiones | **Implementado, pero sin prueba integral** | La ambigüedad multiempresa fue corregida con código de organización; siguen pendientes BD, rate limit y revisión de cookies vencidas. |
| Autorización y aislamiento organizacional | **Implementado, pero sin prueba integral** | Mutaciones y relaciones sensibles se reforzaron y tienen regresiones unitarias; falta comprobarlas contra PostgreSQL/RLS. |
| Dashboard | **Implementado, pero sin prueba integral** | Consultas e indicadores existen; no se validaron contra datos y tiene omisiones e inconsistencias descritas abajo. |
| Categorías | **Implementado parcialmente** | Alta y activación/desactivación; falta edición, manejo amable de duplicados y prueba con BD. |
| Vehículos, seis categorías | **Implementado parcialmente** | Se corrigió el fallo P0 de tenant con pruebas de acción; faltan prueba integral, campos y estados. |
| Propietarios | **Implementado parcialmente** | Alta y listado; sin edición, detalle, desactivación ni pruebas persistentes. |
| Empresas transportadoras | **Implementado parcialmente** | Alta y listado; sin edición, detalle, desactivación ni pruebas persistentes. |
| Conductores | **Implementado parcialmente** | Alta y listado; no hay asignación histórica a vehículos ni CRUD completo. |
| Control documental | **Implementado parcialmente** | Alta y actualización quedan pendientes; revisión/rechazo exigen otro usuario autorizado y generan auditoría. Falta prueba integral, renovación y archivo privado. |
| Cálculo de vigencia | **Implementado parcialmente** | Las fechas civiles y su presentación están corregidas y probadas; `REJECTED` todavía se mezcla con pendiente. |
| Alertas escalonadas | **Implementado, pero sin prueba integral** | Recuperación configurable, exclusión de inactivos, clave lógica idempotente, bloqueo asesor y trazabilidad implementados; faltan pruebas reales de concurrencia y persistencia. |
| Prevención de duplicados | **Implementado, pero sin prueba integral** | Índice parcial de placas y unicidad de eventos están en migración; no se probaron concurrencia ni BD real. |
| Renovaciones | **Pendiente** | Modelos y contador en dashboard; no hay páginas, acciones ni flujo operativo. |
| Reportes CSV | **Implementado parcialmente** | Dos exportaciones; sin prueba real y vulnerables a fórmulas de hoja de cálculo. |
| Auditoría | **Implementado parcialmente** | Existe `AuditLog`, pero no cubre todas las mutaciones ni captura IP. |
| Archivos privados | **Pendiente** | Solo existe `fileKey` en el modelo; no hay carga, descarga, autorización ni almacenamiento. |
| Diseño de escritorio | **Implementado, pero sin prueba integral** | Login revisado visualmente; pantallas protegidas no pudieron renderizarse. |
| Responsive y accesibilidad | **Con errores** | La navegación desaparece en móvil y varios labels no están asociados a sus controles. |
| Integración Supabase | **Pendiente** | No se modificó por instrucción; la base PostgreSQL es aprovechable, pero auth/storage/RLS exigen diseño. |

## 4. Inventario de páginas y rutas

La compilación generó las siguientes rutas:

| Ruta | Implementación encontrada | Estado de auditoría |
|---|---|---|
| `/` | Redirección a `/dashboard` | Compila; depende de protección posterior |
| `/login` | Formulario de acceso | Render de escritorio probado; login real no probado |
| `/dashboard` | Métricas, gráficos, alertas y resumen de renovaciones | Compila; requiere BD |
| `/vehiculos` | Listado, búsqueda, filtros y paginación | Compila; contiene defectos en parámetros/paginación |
| `/vehiculos/nuevo` | Alta de vehículo | Compila; requiere BD |
| `/vehiculos/[id]` | Detalle e historial | Compila; requiere BD |
| `/vehiculos/[id]/editar` | Edición | Compila; aislamiento P0 corregido, pendiente de BD |
| `/documentos` | Listado, filtro y acceso a revisión | Compila; sin paginación |
| `/documentos/nuevo` | Alta documental pendiente de revisión | Compila; requiere BD |
| `/documentos/[id]` | Detalle, historial y revisión separada | Compila; requiere BD y dos usuarios |
| `/documentos/[id]/editar` | Propuesta de nueva versión | Compila; no activa vigencia hasta aprobación |
| `/alertas` | Eventos y reglas, acción de revisión | Compila; motor con recuperación pendiente de BD |
| `/personas` | Altas y listados de propietarios, empresas y conductores | Compila; CRUD incompleto |
| `/categorias` | Alta y toggle activo/inactivo | Compila; CRUD incompleto |
| `/reportes` | Contadores y enlaces CSV | Compila; conteo de vencidos inconsistente |
| `/sin-permiso` | Pantalla de acceso denegado | Compila |
| `/api/reportes/vehiculos.csv` | Exportación por organización | Compila; requiere sesión/BD |
| `/api/reportes/documentos.csv` | Exportación por organización | Compila; requiere sesión/BD |

No existen rutas de renovaciones, administración de usuarios/roles, reglas documentales, configuración de alertas, carga/consulta de archivos, recuperación de contraseña, importaciones ni calendario.

## 5. Problemas críticos

### P0-01 — Ruptura de aislamiento multiempresa al editar vehículos — corregido en código

En `src/app/actions/vehicles.ts:61-90`, `updateVehicleAction` comprueba que el vehículo pertenece a la organización, pero guarda directamente `categoryId`, `ownerId` y `companyId` recibidos. A diferencia del alta (`src/app/actions/vehicles.ts:26-34`), no verifica que esas entidades estén activas y pertenezcan a la misma organización.

Un usuario autenticado que conozca o consiga un CUID de otra organización podría crear relaciones cruzadas. Las claves foráneas solo comprueban existencia, no igualdad de `organizationId`.

**Corrección aplicada:** `updateVehicleAction` vuelve a consultar y valida vehículo, categoría, propietario y empresa dentro del tenant; la actualización usa `updateMany` con `organizationId`; las acciones rechazan defensivamente incluso un registro devuelto con tenant incorrecto. También se reforzaron relaciones anidadas de consultas y exportaciones. Hay pruebas negativas de las acciones de vehículo y documento. **Pendiente:** confirmar restricciones, concurrencia y aislamiento con PostgreSQL, y posteriormente RLS.

### P0-02 — Fechas de calendario mostradas un día antes — corregido y probado en unidad

`src/lib/utils.ts:8-15` convierte un valor PostgreSQL `DATE` representado a medianoche UTC y lo vuelve a interpretar en `America/Bogota`. La auditoría confirmó:

```text
Entrada:  2026-10-22T00:00:00.000Z
Pantalla: 21/10/2026
```

Esto afecta vencimientos, matrículas, expediciones e historiales. Los cálculos de `dateKey/daysUntil` usan componentes UTC y no presentaron este error; el fallo está en el formateo para pantalla.

**Corrección aplicada:** todos los valores `@db.Date` usados por formularios, acciones, alertas, reportes y seed pasan por funciones de fecha civil. La presentación extrae componentes UTC de la representación Prisma y no aplica una segunda conversión a Bogotá. Las pruebas cubren la fecha originalmente defectuosa, límites de mes/año y febrero bisiesto. **Pendiente:** round-trip real contra PostgreSQL.

### P0-03 — Identidad ambigua entre organizaciones — corregido en código

El esquema solo hace único el correo dentro de una organización (`prisma/schema.prisma:142`), pero `loginAction` usa `findFirst` exclusivamente por correo (`src/app/actions/auth.ts:16-19`). Si el mismo correo existe en dos organizaciones, la cuenta elegida depende del resultado de la consulta.

**Corrección aplicada:** cada organización tiene `loginCode` único y el formulario lo exige. La identidad se busca mediante la clave compuesta `organizationId_email`; se eliminó `findFirst` por correo. Las pruebas demuestran que el mismo correo selecciona cuentas distintas solo con el código correspondiente y que no se acepta un registro de otro tenant. Se agregó una migración, pero **no fue aplicada**. La futura integración con Supabase Auth deberá conservar esta selección explícita o reemplazarla por una membresía equivalente.

### P0-04 — Separación insuficiente entre carga y verificación documental — corregido en código

**Corrección aplicada:** el cliente ya no puede enviar un estado de verificación. Toda alta o actualización crea una `DocumentVersion` pendiente; una actualización no sustituye la vigencia activa. Solo `ADMIN` o `SUPERVISOR` pueden revisar desde una acción de servidor y el autor de la versión no puede aprobarla ni rechazarla, aunque sea administrador. La aprobación activa los datos propuestos y cancela alertas abiertas de la vigencia anterior; el rechazo exige motivo. Alta, propuesta, aprobación y rechazo generan `AuditLog` dentro de la misma transacción.

Las consultas y mutaciones de revisión validan organización, tipo documental y vehículo. El esquema agrega creador, revisor, fechas/motivo, claves foráneas e índice parcial para impedir más de una versión pendiente por documento. El seed demostrativo usa dos identidades distintas y deja auditoría de ambas actuaciones.

**Evidencia disponible:** pruebas unitarias de roles, autor distinto, versión pendiente y tenant; pruebas de acciones que rechazan una versión ajena y la autoaprobación. **Pendiente:** aplicar la migración en un entorno autorizado y comprobar transacciones, índice parcial, auditoría y flujo UI autenticado con dos usuarios reales.

Los documentos ya marcados como verificados antes de esta migración conservarán ese estado y pueden no tener `verifiedById`; deben identificarse y regularizarse con una decisión de negocio antes de una carga de datos real. La migración no inventa un verificador ni desactiva vigencias históricas silenciosamente.

### P0-05 — Continuidad e idempotencia del motor de alertas — corregido en código

**Corrección aplicada:** cada umbral tiene una fecha lógica estable (`vencimiento - anticipación`). El motor genera el evento en esa fecha o lo recupera después dentro de `ALERT_RECOVERY_DAYS` (7 días por defecto, máximo 30); lo que quede fuera se omite y registra para evitar una inundación histórica. Solo evalúa documentos verificados de vehículos no inactivos, no recorre versiones históricas y la aprobación de una nueva vigencia cancela eventos abiertos de la anterior.

Cada ejecución y decisión queda registrada como generada, recuperada, ya existente, omitida o fallida. La restricción única `(documento, regla, fecha lógica)` mantiene la idempotencia y un advisory lock transaccional de PostgreSQL evita dos ejecuciones simultáneas del motor. Los canales externos permanecen desactivados.

**Evidencia disponible:** pruebas unitarias para interrupciones de 1, 3, 7 y 15 días, política ampliada, reejecución con la misma fecha lógica, cambio de mes/año y año bisiesto. **Pendiente:** validar advisory lock, restricción única, savepoints, cancelación y recuperación con PostgreSQL real, incluidas dos ejecuciones concurrentes. La matriz `DocumentRequirement`, escalamiento y reintentos externos siguen fuera de este P0.

## 6. Problemas importantes

### Seguridad, permisos y protección de datos

- `getSessionUser` intenta borrar cookie y sesión vencida durante una lectura que puede ocurrir en un Server Component (`src/lib/auth.ts:36-49`). Next.js restringe la modificación de cookies a acciones o route handlers; debe probarse y reestructurarse.
- No hay rate limiting, bloqueo temporal, contador de intentos ni protección específica contra fuerza bruta en login.
- `SESSION_TTL_HOURS` se convierte con `Number` sin validar rango o `NaN`.
- No hay rotación de sesión, administración de sesiones activas ni revocación global al cambiar credenciales/rol.
- El rol de `DOCUMENT_MANAGER` también puede crear propietarios, empresas y conductores; debe confirmarse con la matriz real de permisos.
- `AuditLog` no cubre alta de propietarios/empresas/conductores, revisión de alertas, exportaciones ni otros accesos sensibles.
- El campo IP existe en el modelo, pero `src/lib/audit.ts` no lo recibe ni lo guarda.
- No hay política implementada de retención, minimización, enmascaramiento, exportación o eliminación de datos personales.
- No hay RLS. El aislamiento depende exclusivamente del código de aplicación y ya tiene al menos una brecha comprobada por revisión.
- Las nuevas relaciones de autor/revisor documental tienen claves foráneas, pero la inmutabilidad de versiones no está reforzada mediante permisos o triggers de BD.
- `AlertRule.companyId` y `vehicleId` no tienen claves foráneas en el esquema, permitiendo referencias colgantes o de otro tenant.

### Vehículos y seis categorías

- Las seis categorías solo se crean en `prisma/seed.ts`; el CRUD es genérico y no se probó con BD.
- No hay campos visibles/guardados para cilindraje, contrato de afiliación o fecha de afiliación, previstos en el dominio inicial.
- La UI no permite transiciones a mantenimiento/suspendido ni reactivar un vehículo.
- Desactivar no pide confirmación y no cierra/cancela alertas abiertas.
- La búsqueda solo cubre placa, aunque la barra global promete propietario y documento.
- `params.status` se fuerza por TypeScript sin validar el valor real (`src/app/(dashboard)/vehiculos/page.tsx:11`); una URL manipulada puede provocar error de Prisma.
- `Number(params.page)` puede producir `NaN` y llegar a `skip`.
- Los enlaces de paginación pierden búsqueda y filtros; “Anterior” sigue siendo enlace aunque tenga `aria-disabled`.
- No hay prueba de colisión concurrente para el índice parcial de placa activa.

### Propietarios, empresas y conductores

- Solo existen acciones de creación y listados resumidos.
- No existen edición, detalle, desactivación, reactivación ni manejo explícito de duplicados.
- La página consulta todos los registros, pero muestra solo los primeros ocho sin paginación ni enlace “ver más”.
- No hay asignación/desasignación de conductor a vehículo, aunque el esquema tiene `VehicleDriver`.
- No se auditan las altas de estas entidades.
- No se visualiza ni administra el historial de afiliación empresarial fuera del detalle básico del vehículo.

### Documentos, vencimientos y renovaciones

- El alta solo permite sujeto vehículo, aunque el modelo admite documento de propietario, empresa o conductor.
- Ya existe propuesta de actualización, rechazo, verificación separada y vista del historial; siguen pendientes anulación formal, adjuntos privados y prueba integral.
- No se controla duplicidad lógica de documento vigente por sujeto/tipo/número.
- No se usan `DocumentRequirement` ni la aplicabilidad por categoría.
- No hay soporte para fecha límite de pago ni otros hitos del trámite.
- `documentValidity` convierte `REJECTED` en `PENDIENTE_VERIFICACION` (`src/lib/dates.ts:40-42`), ocultando un estado relevante.
- El reporte considera vencido `expiresAt < new Date()` (`src/app/(dashboard)/reportes/page.tsx:11`); un `DATE` de hoy a medianoche puede contarse vencido durante el mismo día, mientras el dominio lo considera urgente con cero días.
- Los modelos `RenewalTask` y `RenewalComment` existen, pero no hay acciones, páginas, comentarios, cambio de estados, cierre ni creación de nueva versión documental.

### Dashboard e indicadores

Las fórmulas de vigencia reutilizan `documentValidity`, lo cual es positivo. No obstante, no se pudo contrastar ningún valor con registros reales y se observaron estas limitaciones:

- “Vehículos registrados” mezcla activos e inactivos; solo el texto secundario muestra activos.
- El gráfico por categoría cuenta también vehículos inactivos.
- El gráfico documental omite `SIN_INFORMACION` y no distingue `REJECTED`.
- Los indicadores prometidos de 30/60/90 días, verificación pendiente, alertas críticas y evolución mensual no están implementados.
- Renovaciones solo muestra contadores de tablas que todavía no tienen flujo de creación.
- Todas las filas de vehículos/documentos se cargan en memoria para calcular métricas; debe migrarse a agregaciones para mayor escala.
- El gráfico circular no presenta una leyenda textual suficientemente clara para depender menos del color.

### Formularios, botones y elementos que aparentan funcionar

- La búsqueda global del topbar no tiene `form`, `name`, acción ni manejador (`src/components/topbar.tsx:6-10`).
- El botón de campana no abre notificaciones ni navega a alertas.
- Los parámetros `?creado=`, `?actualizado=` y `?error=` se generan, pero las páginas no muestran notificaciones consistentes.
- No hay confirmación para desactivar vehículo o categoría.
- No hay estados de error de página, límites de error ni esqueletos de carga.
- Categorías no tiene edición aunque se presenta como catálogo administrable.
- Los botones CSV descargan datos reales solo con sesión/BD; no fueron probados.
- “Marcar revisada” cambia el estado, pero no genera auditoría ni comentario de gestión.

### Exportaciones

Las rutas verifican sesión y filtran por organización, pero el escape CSV solo duplica comillas. Valores iniciados por `=`, `+`, `-` o `@` pueden ejecutarse como fórmulas al abrir el archivo en Excel.

**Corrección requerida:** neutralizar fórmulas, definir codificación/BOM según usuarios objetivo, auditar exportaciones y probar aislamiento por tenant.

### Mantenibilidad

- Prisma advierte que la configuración `prisma.seed` dentro de `package.json` está deprecada y deberá moverse a `prisma.config.ts` antes de una actualización mayor.
- `allowScripts` autoriza `sharp@0.34.5`, mientras el override instalado es `0.35.5`; revisar reproducibilidad de instalaciones limpias.
- `docs/ESTADO.md` afirma “navegación responsive”, “aislamiento organizacional” y “alertas idempotentes” de forma más concluyente que la evidencia disponible. Debe ajustarse después de corregir y probar.
- El E2E existente solo comprueba la pantalla de login; no hay cobertura de autenticación ni operaciones.

## 7. Revisión visual, responsive y experiencia de usuario

### Aspectos positivos observados

- La pantalla de login tiene jerarquía visual clara, identidad consistente, buen contraste general y formulario comprensible.
- Los controles de login tienen nombres accesibles y el layout de escritorio se renderiza correctamente.
- El sistema de tarjetas, tablas, estados y colores es consistente en el código.
- Las tablas permiten desplazamiento horizontal mediante `.table-shell`.

### Defectos y riesgos

- En `src/app/globals.css:70-73` el sidebar se oculta por debajo de 860 px, pero no existe menú hamburguesa, drawer ni navegación inferior. En móvil el usuario pierde el acceso a todos los módulos.
- La auditoría visual móvil no pudo ejecutarse con la capacidad disponible; este defecto se confirma por código, no por captura.
- La mayoría de labels de formularios de vehículo/documento/catálogos no usa `htmlFor` asociado a un `id`.
- No hay breadcrumbs, aunque son importantes en detalle/edición.
- Tablas de 720 px dependen del scroll horizontal y necesitan señales visuales/columnas priorizadas en móvil.
- Las acciones destructivas carecen de confirmación y la retroalimentación posterior es insuficiente.
- No se pudieron revisar visualmente las páginas protegidas por depender de sesión y BD.

## 8. Pruebas actuales y vacíos de cobertura

### Lo que sí cubren las 80 pruebas unitarias

- normalización y formatos admitidos de placa;
- diferencias de fechas en varios umbrales, cambio de mes y año bisiesto;
- clasificación básica de documento verificado/pendiente;
- fecha lógica e intervalos de recuperación de alertas de 1, 3, 7 y 15 días;
- omisión controlada fuera de la ventana configurable, cambios de mes/año y año bisiesto;
- preservación y presentación de fechas civiles, incluidos cambios de mes/año y año bisiesto;
- rechazo de referencias de otro tenant en helpers y acciones de vehículos/documentos;
- separación de funciones documental por rol, autor, estado y organización;
- rechazo desde la acción de servidor de una versión ajena y de la autoaprobación administrativa;
- eliminación de `organizationId` no autorizado en formularios de catálogos;
- resolución inequívoca de un mismo correo en dos organizaciones mediante código de organización.

### Lo que no cubren

- `REJECTED`;
- ejecución real de queries Prisma, migración y seed;
- autenticación con contraseña/sesión real, expiración de sesión y roles;
- aislamiento entre organizaciones respaldado por PostgreSQL/RLS;
- CRUD y duplicados en BD;
- historial de propietario/afiliación;
- persistencia y atomicidad de versiones, verificación y auditoría documental;
- idempotencia real y concurrencia de alertas;
- consultas reales para excluidos/inactivos, cancelación al aprobar una nueva vigencia y renovación;
- dashboard con fixtures conocidos;
- CSV y prevención de fórmulas;
- responsive y accesibilidad de páginas protegidas.

Las pruebas puras demuestran que una reejecución conserva la misma fecha lógica, pero no pueden demostrar por sí solas que dos procesos concurrentes produzcan un único registro; eso queda expresamente pendiente de PostgreSQL.

## 9. Funcionalidades que requieren obligatoriamente base de datos

Para declarar el producto funcional deben probarse con PostgreSQL/Supabase en un entorno aislado:

1. Login correcto/incorrecto, creación, expiración y cierre de sesión.
2. Roles, acceso denegado y cambio/desactivación de usuario.
3. Aislamiento multiempresa de cada lectura, mutación y exportación.
4. Alta, edición, desactivación y duplicados concurrentes de vehículos.
5. Creación y cierre de historiales de propietario, empresa y conductor.
6. Alta documental transaccional y creación de versión.
7. Unicidad, integridad y consultas del esquema/migración real.
8. Dashboard con un conjunto de datos cuyo resultado esperado esté calculado previamente.
9. Seed idempotente y claramente separado de datos reales.
10. Motor de alertas, idempotencia concurrente, reejecución, alcance de reglas y exclusión de inactivos.
11. Flujo completo de renovación y cierre de alertas/versiones antiguas.
12. Descargas CSV autenticadas y aisladas por organización.
13. Comportamiento de cookies/sesiones en el runtime real de Next.js.
14. Más adelante, políticas RLS, Supabase Auth y Storage con usuarios de prueba de distintos tenants.

## 10. Compatibilidad y preparación para Supabase

### Compatible o reutilizable

- Supabase usa PostgreSQL; los modelos relacionales, enums, índices y migración Prisma son conceptualmente reutilizables.
- Prisma puede seguir siendo la capa de acceso del servidor.
- `organizationId` presente en las entidades principales facilita el diseño multiempresa.
- `fileKey` permite almacenar una referencia lógica a objetos en Storage.
- La separación de funciones puras de fechas/alertas facilita ejecutar pruebas fuera de Supabase.

### Decisiones necesarias antes de conectar

1. **Modelo de acceso:** decidir entre Prisma exclusivamente en servidor, Supabase Data API/client con RLS, o un modelo híbrido explícito. No asumir que usar Prisma activa RLS automáticamente.
2. **Identidad:** Supabase Auth usa una identidad propia. El modelo actual exige `User.passwordHash` y sesiones propias. Definir si `User` conserva un perfil enlazado por un `authUserId` único o si se cambia la PK.
3. **Tenant:** decidir cómo se selecciona la organización y cómo se expresa en JWT/claims o membresías. Un usuario podría pertenecer a una o varias organizaciones.
4. **RLS:** crear políticas por organización para cada tabla expuesta. Las operaciones administrativas del servidor deben usar una credencial separada y nunca enviarla al navegador.
5. **Conexiones Prisma:** separar URL de migraciones y URL de runtime/pool según el entorno elegido. Configurar límites y estrategia para despliegue serverless cuando corresponda.
6. **Storage privado:** crear bucket privado, convención de rutas por organización, políticas, URLs firmadas de corta duración, límites de tamaño/MIME, antivirus y registro de acceso.
7. **Alertas programadas:** definir si el scheduler será externo, Supabase Cron/Edge Function u otro proceso, con recuperación de fallos e idempotencia.
8. **Migraciones:** revisar la migración inicial en un proyecto Supabase vacío de prueba; no modificar el proyecto real hasta aprobar el diseño.
9. **RLS + Prisma:** agregar pruebas que usen identidades de dos organizaciones. Una conexión privilegiada puede ocultar fallos de políticas, por lo que deben probarse ambos caminos.
10. **Secretos:** mantener URLs, anon key y service role solo en variables apropiadas; la service role nunca debe exponerse como variable pública `NEXT_PUBLIC_*`.

### Cambios recomendados al modelo antes de migrar

- resolver identidad y membresía organizacional;
- agregar `verifiedById` y relaciones faltantes;
- reforzar consistencia de tenant en relaciones críticas;
- agregar checks para rangos de fechas e historiales;
- definir una clave de idempotencia por versión/umbral para alertas;
- modelar metadata segura de archivo, hash, MIME, tamaño y estado de análisis;
- decidir si los CUID existentes se conservan o se adoptan UUID en nuevas entidades. No es obligatorio cambiar a UUID solo por usar Supabase.

## 11. Funcionalidades pendientes

- CRUD completo de propietarios, empresas, conductores y categorías.
- Asociación e historial de conductores.
- Matriz de requisitos documentales por categoría/sujeto.
- Carga y consulta segura de PDF/imágenes.
- Renovación completa con tareas, responsables, comentarios, soportes y cierre.
- Cancelación/resolución automática de alertas al desactivar vehículos y cierre integral de renovaciones.
- Editor de reglas y canales de alertas.
- Reintentos y proveedor real de correo; hoy solo se crea un delivery simbólico.
- Administración de usuarios, roles, recuperación de contraseña y sesiones.
- Búsqueda global real.
- Importaciones, reportes avanzados, calendario y exportaciones adicionales.
- Navegación móvil.
- Estados de carga/error, notificaciones y confirmaciones.
- Suite E2E autenticada, integración PostgreSQL y pruebas multiempresa.

## 12. Plan de correcciones por prioridad

### P0 — Antes de cargar datos o mostrar a Autolegal

1. **Corregido en código:** aislamiento de referencias en edición de vehículo y pruebas multiempresa. Pendiente integración con BD.
2. **Corregido y probado en unidad:** fechas civiles y definición de “vence hoy”. Pendiente round-trip con BD.
3. **Corregido en autenticación local:** identidad/tenant mediante código de organización. Pendiente integración con BD y futura alineación con Supabase Auth.
4. **Corregido en código y probado en unidad:** separar carga/actualización de la revisión documental, impedir autoaprobación y registrar autor, revisor, rechazo y auditoría. Pendiente integración con BD.
5. **Corregido en código y probado en unidad:** recuperación configurable, fecha lógica idempotente, exclusión de inactivos, trazabilidad y bloqueo concurrente. Pendiente integración y concurrencia real con PostgreSQL.
6. Crear un entorno PostgreSQL/Supabase de prueba, aplicar la migración solo tras aprobación y ejecutar pruebas integrales.

### P1 — Antes de una demostración funcional

1. Implementar navegación móvil, validación de query params y preservación de filtros.
2. Completar CRUD mínimo de personas/empresas/conductores/categorías con auditoría.
3. Implementar matriz de aplicabilidad documental.
4. Implementar flujo mínimo de renovación y resolución de alertas.
5. Añadir confirmaciones, mensajes de éxito/error y límites de error.
6. Corregir dashboard/reportes y crear fixtures con resultados esperados.
7. Proteger CSV contra fórmulas y auditar exportaciones.
8. Añadir rate limit de login, validación de configuración y manejo seguro de sesiones vencidas.

### P2 — Endurecimiento previo a piloto

1. Diseñar y probar RLS, Auth y Storage privado de Supabase.
2. Agregar carga segura de archivos, URLs firmadas, límites y análisis.
3. Implementar pruebas de concurrencia/idempotencia y recuperación del scheduler.
4. Optimizar indicadores con agregaciones SQL.
5. Completar accesibilidad, breadcrumbs, responsive de tablas y pruebas móviles.
6. Actualizar documentación de estado para que diferencie implementado, probado y pendiente.

### P3 — Evolución posterior

- importaciones masivas con previsualización;
- reportes avanzados, PDF/Excel y calendario;
- correo productivo y métricas operativas;
- políticas de retención y gobierno de datos;
- observabilidad, respaldos y procedimientos de recuperación.

## 13. Criterio de salida recomendado

AUTOLEGAL CONTROL debería considerarse listo para presentación funcional solo cuando:

- no queden hallazgos P0;
- migración y seed hayan sido probados en un entorno aislado autorizado;
- los flujos de login, vehículos, documentos, alertas y renovación tengan pruebas E2E exitosas;
- dos organizaciones de prueba demuestren aislamiento en UI, acciones, exports y políticas;
- dashboard y vencimientos hayan sido contrastados con fixtures conocidos;
- la navegación móvil permita acceder a todos los módulos;
- archivos y secretos estén protegidos conforme al diseño Supabase aprobado.

Hasta entonces, puede mostrarse como **avance de interfaz y arquitectura**, pero no debe afirmarse que el control documental, las alertas o las renovaciones funcionan de principio a fin.
