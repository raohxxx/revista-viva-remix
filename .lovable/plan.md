# VIDA — Panel de control con fondo de marca y tarjetas glass

## Qué se construye

Nueva presentación visual del panel "Análisis de Churn", tomando como base exacta la imagen que subiste: el fondo abstracto de ondas azul, violeta y rosa con los puntos, la línea ascendente y las barras suaves, más el logo VIDA arriba a la izquierda junto al título de la página.

Sobre ese fondo, las tarjetas de datos pasan a un estilo vidrio: superficie semitransparente, desenfoque detrás, borde claro y sombra suave, de modo que el patrón se vea a través de ellas sin perder legibilidad.

## Contenido de la pantalla

1. **Cabecera**: logo VIDA (con la hoja verde en la "V"), línea divisoria vertical de color y el título "ANÁLISIS DE CHURN" en mayúsculas espaciadas, igual que en la referencia. A la derecha se mantienen periodo, actualizar y menú de usuario.
2. **Esquina superior derecha**: tarjeta con gráfico circular tipo dona "RETENCIÓN DE USUARIOS", con el porcentaje al centro, alimentado con los datos reales de la cartera (retenidos frente a clientes en riesgo).
3. **Fila de métricas** en tarjetas vidrio: MRR total, MRR en riesgo, clientes en riesgo y renovaciones a 30 días (los mismos indicadores actuales).
4. **Resto del panel**: acción recomendada, causas de riesgo, distribución de riesgo, evolución y lista de acción inmediata, todos convertidos al mismo estilo vidrio sobre el fondo.

Los cálculos, filtros, datos y navegación no cambian: es solo presentación.

## Sobre las imágenes

Solo llegó una imagen (logo + fondo juntos). El logo de esa imagen no incluye el eslogan "UNA REVISTA PARA VIVIR MEJOR" ni la palabra "ONLINE". Propuesta: usar el logo tal como aparece en la imagen que enviaste, y recrear el eslogan y "ONLINE" en texto con tipografía y colores equivalentes. Si tienes el archivo del logo completo, súbelo y lo incorporo tal cual.

## Detalle técnico

- El fondo se sube al CDN con `lovable-assets` y se aplica como capa fija en el shell autenticado (`AppShell.tsx`), con `background-size: cover` y una capa de velo blanco/translúcido para asegurar contraste; en móvil se usa una versión más plana.
- Nuevos tokens en `src/styles.css`: `--glass-surface`, `--glass-border`, `--glass-shadow`, `--brand-violet`, `--brand-pink`, más una variante `glass` para `Card` y `MetricCard` (nada de colores en crudo en los componentes).
- Cabecera de marca en un componente nuevo `src/components/layout/BrandLockup.tsx` (logo + divisoria + título de ruta), usado desde `AppShell.tsx`.
- Dona de retención: nuevo `src/components/dashboard/RetentionDonut.tsx` con Recharts `PieChart` + `ResponsiveContainer`, calculada desde `computeOverview` (sin lógica nueva de negocio).
- `resumen.tsx` reordena su rejilla para colocar la dona arriba a la derecha y aplica la variante glass; el resto de rutas hereda el fondo y el estilo de tarjetas.
- El desenfoque se escribe solo con utilidades estándar de Tailwind (`backdrop-blur`), sin prefijos manuales.
- Verificación: build, typecheck y recorrido con Playwright a 1920×1080, 1440×900, 1280×720 y 390×844 comprobando contraste, ausencia de desbordes y consola limpia.
