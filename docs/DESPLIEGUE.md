# Guía de despliegue

Esta guía documenta el camino; no autoriza ni realiza un despliegue.

1. Aprovisionar PostgreSQL administrado con cifrado, copias automáticas y restauraciones ensayadas.
2. Definir variables en el gestor de secretos de la plataforma; nunca copiar `.env` al repositorio.
3. Ejecutar `npm ci`, `npm run db:deploy`, `npm test` y `npm run build` en CI.
4. Ejecutar la aplicación con HTTPS y `NODE_ENV=production`.
5. Programar `npm run alerts:run` diariamente con zona `America/Bogota` y exclusión mutua.
6. Configurar almacenamiento privado con URL firmada y análisis de archivos antes de habilitar adjuntos.
7. Configurar correo transaccional en modo de prueba, verificar dominio y habilitarlo después de aprobación.
8. Centralizar registros sin datos sensibles y alertar fallos de trabajos programados.

## Respaldo

- Copia PostgreSQL diaria, cifrada, con retención definida por Autolegal.
- Prueba de restauración mensual en entorno aislado.
- Los archivos privados requieren copia independiente y verificación de integridad.
- Documentar RPO/RTO, responsables y procedimiento de contingencia antes de producción.

## Lista previa a producción

- Sustituir el entorno demo por una organización de producción vacía.
- Revisar matriz de aplicabilidad con responsable jurídico/administrativo.
- Completar evaluación de protección de datos personales.
- Rotar todas las credenciales iniciales.
- Ejecutar pruebas E2E y revisión de seguridad.
