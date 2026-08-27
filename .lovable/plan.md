# RevistaViva Retention Intelligence — Demo autónoma según checklist

Objetivo: cumplir el checklist al 100%. La app pasa de sistema conectado a **demo autónoma sin login, sin backend y con el motor de riesgo aún no configurado**.

Advertencia clara: esto **elimina** funcionalidad hoy operativa (autenticación, base de datos, motor de riesgo, priorización, análisis y configuración de reglas). Es un retroceso intencional pedido en el checklist.

## Qué queda en la aplicación

Tres secciones en el sidebar, todas con comportamiento real:

- **Resumen de Retención** — pantalla inicial, con los 5 KPIs en "—" y dos espacios reservados.
- **Clientes** — listado de los 40 suscriptores sintéticos con búsqueda y detalle de ficha (solo datos, sin riesgo calculado).
- **Intervenciones** — registro de acciones de retención guardado solo en memoria de la sesión, indicado explícitamente como demo.

Se retiran del menú y del proyecto: Análisis, Configuración y la pantalla de login.

## Pantalla Resumen

- Título "Resumen de Retención".
- Cinco tarjetas KPI, todas mostrando "—": Suscriptores activos, Clientes en alto riesgo (alto + crítico), Clientes críticos, Ingreso mensual en riesgo (suma del valor mensual de alto + crítico), Renovaciones próximas 30 días. Cada tarjeta explica su definición, sin cifras calculadas.
- Bloque "Distribución de riesgo": estado vacío cuidado, sin gráfico ni porcentajes, con el mensaje "El motor de riesgo aún no está configurado".
- Bloque "Prioridad de hoy": mismo estado vacío y mensaje, sin clientes priorizados.
- Nota visible de que el motor de riesgo se incorporará en una etapa posterior.

## Dataset sintético (en memoria)

Archivo único con exactamente 40 registros, códigos RV-10001 a RV-10040 sin duplicados ni nombres reales, y estos campos por suscriptor: código, plan, fecha de inicio, fecha de renovación, valor mensual, sesiones 30 días, sesiones 30 días anteriores, artículos leídos 30 días, días desde el último acceso, pagos rechazados 90 días, reclamos 90 días y satisfacción 1–10.

Planes exactos: Digital Mensual $6.990, Digital Anual $69.900, Premium $9.990, repartidos de forma variada y coherente con el valor mensual.

Perfiles construidos (etiqueta interna, **no mostrada** en la interfaz mientras el motor no exista): 5 críticos, 8 altos, 12 medios, 15 bajos. Coherencia verificada: inicio anterior a renovación, antigüedades diversas, días sin acceso consistentes con las sesiones, casos con actividad creciente y decreciente, pagos rechazados, reclamos, satisfacciones variadas y renovaciones próximas.

## Identidad y presentación

- Nombre visible "RevistaViva Retention Intelligence" con subtítulo "Detección temprana de riesgo de fuga" en el sidebar/header.
- Indicador discreto "Datos de demostración" en el header.
- Todo en español, fechas DD/MM/AAAA, montos en CLP con punto de miles.
- Colores de riesgo reservados como lenguaje semántico (bajo verde, medio ámbar, alto naranja, crítico rojo); mientras el motor esté apagado solo aparecen en la leyenda/documentación de niveles, no como estado calculado.
- Estética B2B ejecutiva ya existente: se conserva tipografía, tokens y espaciados actuales.

## Detalles técnicos

- Eliminar `src/routes/auth.tsx`, el layout `_authenticated` (rutas pasan a `/resumen`, `/clientes`, `/clientes/$id`, `/intervenciones`), `src/hooks/useAuth.tsx`, `src/hooks/usePortfolio.ts`, `analisis.tsx`, `configuracion.tsx`.
- Eliminar todo acceso a Supabase desde la app: `portfolioService`, `interventionsService`, `rulesService`, `riskEngine`, `churnPrediction`, `analytics`, y los usos de `@/integrations/supabase/*`. Las tablas del backend quedan sin uso (no se borran datos).
- Nuevo `src/data/subscribers.ts` con el arreglo tipado de 40 registros y `src/types/domain.ts` reducido a lo que se usa.
- Intervenciones en memoria mediante un contexto React (`src/state/InterventionsProvider.tsx`) montado en `__root.tsx`; se advierte en pantalla que se pierden al recargar.
- `src/routes/index.tsx` sigue redirigiendo a `/resumen`.
- Componentes de riesgo (`RiskBadge`, `RiskScore`, `PriorityBadge`, `DominantSignalBadge`, `RiskSignals`) se retiran o reducen a la leyenda de colores, para no insinuar cálculos inexistentes.
- Se quitan botones/acciones sin implementación (exportar, recalcular riesgo, etc.).
- Verificación final: `tsgo`, lint y revisión con navegador de `/resumen`, `/clientes`, ficha y `/intervenciones`.
