# VIDA — Rediseño de layout y app shell (auditoría + refactor)

## Diagnóstico de causa raíz

Auditando el shell autenticado (`src/components/layout/AppShell.tsx`), Resumen, Clientes y la ficha:

1. **Shell no acotado al viewport.** El shell usa `min-h-screen` con `<main>` de flujo normal: la altura crece con el contenido, así que todo scroll cae en el documento. No hay ninguna fila `minmax(0,1fr)` ni `100dvh`, por lo que ninguna pantalla puede "caber" por diseño.
2. **Sidebar permanente de 60 (240px).** Roba ancho constante; en 1280px deja ~1000px útiles para tablas de 9 columnas, lo que empuja el contenido y obliga a comprimir/desbordar.
3. **Doble chrome.** Sidebar + header de 56px + `PageHeader` con breadcrumb, título, descripción y badge: tres bandas verticales antes del primer dato.
4. **Densidad vertical excesiva en Resumen.** `space-y-6` + KPIs `p-4` con texto 2xl + tarjetas de gráficos con alturas fijas de Recharts + lista de 8 prioridades ⇒ ~1600px de alto. Imposible en 720px.
5. **Tabla de Clientes.** 9 columnas con celdas que no truncan (nombre + email, badges de señal, badges de prioridad). Los badges son `inline-flex` sin `shrink`, así que el ancho intrínseco de la tabla supera el contenedor y provoca desbordamiento horizontal en ≤1440px.
6. **Ficha `/clientes/$id`.** Una sola columna vertical con score, señales, datos de suscripción, métricas de comportamiento y timeline completo ⇒ scroll largo, sin tabs.
7. **Fondo.** Las vistas autenticadas ya usan un fondo neutro, pero se normalizará al token `#F6F8FB` con superficies blancas y se reservará cualquier ilustración para `/auth`.
8. **Hydration mismatch** del shell (render condicional dependiente del cliente), que además provoca un repaint del layout completo.

No se detectaron `100vw`, márgenes negativos ni posicionamiento absoluto estructural; los overflows vienen de anchura intrínseca sin `min-w-0` + ausencia de truncado, no de un parche que se pueda ocultar.

## Estrategia

**App shell (`AppShell.tsx`, reescrito, misma API `{children}`)**
- `grid h-[100dvh] grid-rows-[auto_minmax(0,1fr)]`, `<main>` con `min-h-0 overflow-y-auto` en escritorio y scroll natural en móvil.
- Se elimina el sidebar permanente. Navegación en **drawer** (Sheet ya instalado) desde un botón de menú, más **command palette** con Ctrl/Cmd+K (`components/ui/command` ya existe).
- Header contextual de 56px: menú, logo VIDA compacto, breadcrumb/título contextual, selector de periodo, última actualización/refrescar, menú de usuario.
- `min-w-0` en cada hijo de grid/flex; `max-w-full` en media.

**Tokens (`src/styles.css`)**
- Paleta VIDA como tokens semánticos (navy, blue, teal, magenta, coral, background #F6F8FB, surface, texto, borde, riesgo alto/medio/bajo) en oklch equivalentes, manteniendo los nombres actuales (`--primary`, `--risk-*`) para no romper componentes.
- Escala tipográfica compacta y `tabular-nums` en métricas.

**Resumen** — command center en una rejilla `grid-rows` que cabe en 720px: barra de contexto, 4 KPIs en una fila, y zona analítica `grid-cols-12` con tendencia de churn, distribución de riesgo, factores principales y lista "necesitan atención" recortada al espacio disponible con "Ver todos".
Gráficos con `ResponsiveContainer` y altura fluida (`min-h-0` + contenedor flexible), nunca alturas fijas.

**Clientes** — toolbar compacta (búsqueda + filtros esenciales + contador + limpiar; el resto en "Más filtros"), tabla `table-fixed` con prioridades de columna (`hidden md:table-cell`, `hidden xl:table-cell`), truncado con tooltip, filas de 44px, menú contextual de acciones y paginación compacta. Sin `min-width` en la tabla.

**Ficha** — header compacto (volver, nombre, código, estado, RiskBadge, RiskScore, última actividad, acción recomendada, menú secundario), bloque de decisión siempre visible (score, factores, señales positivas, MRR, renovación, próxima mejor acción) y tabs: Resumen · Actividad · Suscripción · Interacciones.

**Estados** — `QueryState` amplía skeletons que reservan el mismo alto, error con reintento y vacío por filtros con explicación + chips de filtros activos + limpiar.

**Accesibilidad** — landmarks, foco visible, orden de headings, drawer con foco gestionado, `aria-live` en contadores de resultados, sin emojis como iconos (`DominantSignalBadge` pasa a iconos de lucide), respeto a `prefers-reduced-motion`.

## Archivos

Modificados: `src/styles.css`, `src/components/layout/AppShell.tsx`, `src/components/common/PageHeader.tsx`, `MetricCard.tsx`, `QueryState.tsx`, `EmptyState.tsx`, `src/components/risk/{RiskBadge,RiskScore,DominantSignalBadge,PriorityBadge}.tsx`, `src/components/customers/{CustomerTable,FilterBar}.tsx`, `src/routes/_authenticated/{resumen,intervenciones,analisis,configuracion}.tsx`, `src/routes/_authenticated/clientes/{index,$id}.tsx`, `src/routes/auth.tsx` (solo fondo de marca).

Nuevos: `src/components/layout/NavDrawer.tsx`, `src/components/layout/CommandPalette.tsx`, `src/components/common/CompactToolbar.tsx`, `src/components/common/Pagination.tsx`, `src/components/common/StateViews.tsx` (empty/error/skeleton reutilizables).

Sin cambios: servicios, `usePortfolio`, motor de riesgo, esquema, rutas, auth, filtros/orden/paginación (misma lógica, nueva presentación).

## Validación

Build, lint y typecheck; recorrido con Playwright de `/resumen`, `/clientes`, `/clientes/:id`, `/intervenciones`, `/analisis`, `/configuracion` a 1920×1080, 1440×900, 1280×720, 1024×768, 768×1024 y 390×844, midiendo `scrollWidth/clientWidth` y `scrollHeight/clientHeight`, más consola limpia y prueba de filtros, orden, paginación y navegación por teclado.
