# RevistaViva — De dashboard a Sistema de Decisión de Retención

Mejora sobre la app existente: se conservan nombre, estilo, navegación, rutas, motor heurístico, autenticación ya funcional y el idioma/moneda actuales. No se reconstruye nada desde cero.

## 1. Datos demo coherentes (~40 clientes)

Nueva cartera sintética que reemplaza los 150 registros actuales, generada por perfiles y no al azar:

- Saludable, Desconectado, Problema de pago, Frustrado, Alto riesgo múltiple.
- Se agregan campos `full_name` y `email` (nombres y correos chilenos verosímiles) y `billing_period` (mensual / anual).
- Distribución objetivo aproximada: 5 críticos, 8 altos, 12 medios, 15 bajos — pero el nivel siempre se calcula desde las reglas, nunca se fuerza.
- Intervenciones demo regeneradas y consistentes con los nuevos clientes (pendientes, en curso y completadas con resultado).

**MRR:** los planes anuales se guardan con su precio de lista anual y toda la app calcula el ingreso mensual equivalente dividiendo por 12, mediante un único helper compartido. Ningún KPI suma precios anuales completos.

## 2. Motor de riesgo y prioridad

- Pesos máximos alineados a: actividad 25, inactividad 15, pagos 20, renovación 15, satisfacción 15, soporte 10 (total 100). El score nunca supera 100.
- **Señal dominante**: la señal con mayor aporte de puntos, con etiqueta e icono propios (Pago, Caída de engagement, Insatisfacción, Renovación próxima, Soporte, Sin señales relevantes).
- **Priority Score** transparente y separado del Risk Score: riesgo + urgencia de renovación + valor económico + bonus por señales críticas (pago rechazado), normalizado 0–100 y clasificado en Muy alta / Alta / Media / Baja.
- **Explicación en lenguaje simple** generada por reglas a partir de las señales activas (sin lenguaje probabilístico ni de Machine Learning).
- **Recomendación por causa**: motor de reglas que devuelve acción concreta + motivo + urgencia según la combinación de señales (pago, caída de actividad, insatisfacción, reclamo, renovación próxima + baja actividad, múltiples señales críticas).

## 3. Resumen (dashboard ejecutivo)

- Exactamente 4 KPIs: Clientes en riesgo (Alto+Crítico), Clientes críticos, MRR en riesgo, Intervenciones pendientes.
- Tarjeta protagonista **“Acción recomendada hoy”**: N clientes requieren atención inmediata, MRR asociado, señal dominante más frecuente y botón **Ver clientes prioritarios** que navega a Clientes con el filtro de prioridad alta aplicado.
- Distribución del riesgo compacta (Crítico / Alto / Medio / Bajo).
- **Principales señales de riesgo**: barras horizontales con la frecuencia de cada señal dominante en la cartera.
- **Clientes que requieren acción hoy**: top 5 por prioridad con cliente, Risk Score, riesgo, prioridad, señal dominante, renovación, MRR y acción recomendada, más botón “Ver todos los clientes”.
- **Impacto potencial**: escenarios Conservador 10% / Moderado 25% / Optimista 40% sobre el MRR en riesgo, con nota visible de que son estimaciones, no ingresos garantizados.
- Se retira el exceso de gráficos para que el dashboard se lea en menos de 10 segundos.

## 4. Clientes

- Columnas: Cliente (nombre + código), Plan, Risk Score, Riesgo, Prioridad, Señal dominante, Próxima renovación, MRR, Acción.
- Filtros: nivel de riesgo (Todos/Crítico/Alto/Medio/Bajo), prioridad, señal dominante y plan.
- Búsqueda por nombre, código de cliente y correo.
- Orden por riesgo, prioridad, renovación más próxima y MRR; **por defecto prioridad descendente**.
- Soporta llegar prefiltrada desde el dashboard mediante parámetros en la URL.

## 5. Perfil del cliente

- Encabezado con nombre, ID, email, plan, MRR, próxima renovación, Risk Score, nivel, prioridad y señal dominante.
- Sección **“Por qué está en riesgo”**: barra por señal con su aporte en puntos y el total sobre 100, más el párrafo explicativo en lenguaje simple.
- **Línea de tiempo del cliente** construida solo desde datos reales del registro (caída de actividad, último acceso, encuesta de satisfacción, reclamo, pago rechazado, próxima renovación) e intervenciones registradas. Sin eventos inventados.
- Bloque **Acción recomendada** con acción, motivo y urgencia.
- Botón destacado **Crear intervención**.

## 6. Intervenciones

- Modal de creación con Tipo (Llamada, Email, WhatsApp, Oferta/descuento, Seguimiento), Responsable (Jorge Molina, Camila Soto, Luis Herrera), Estado, Nota y Resultado (visible solo si está Completada: Retenido, No responde, Seguimiento necesario, Rechazó oferta, Canceló).
- Vista Intervenciones: columnas Cliente, Tipo, Responsable, Fecha, Prioridad, Estado, Resultado; filtros por estado y KPIs de Intervenciones pendientes y Clientes retenidos.
- Se conserva la persistencia actual en la base de datos, de modo que una intervención creada desde el perfil aparece de inmediato en la vista Intervenciones.

## 7. Estilo y cierre

- Se mantiene la paleta semántica actual (crítico rojo, alto naranja, medio amarillo, bajo verde), usada solo para comunicar riesgo y prioridad; sin gradientes ni adornos.
- Se corrige el error de hidratación existente en el layout.
- Configuración del modelo queda como vista secundaria mostrando los pesos.
- Verificación final del recorrido de demo: Resumen → Ver clientes prioritarios → cliente crítico → explicación y timeline → crear intervención → aparece en Intervenciones, revisando consola, filtros, orden, responsive y coherencia de KPIs.

## Detalle técnico

- Migración: columnas `full_name`, `email`, `billing_period` en `subscribers`; reemplazo de las filas demo y de `retention_actions` / `risk_assessments` / `risk_history` por el nuevo conjunto sembrado con INSERT literales.
- `src/lib/format.ts`: helper `monthlyRevenue(subscriber)` usado por todos los KPIs y tablas.
- `src/services/riskEngine.ts`: pesos normalizados, prioridad revisada, generador de explicación y motor de recomendaciones por combinación de señales.
- `src/components/customers/filters.ts`: filtros de prioridad y búsqueda ampliada; orden por defecto por prioridad.
- Cambios de UI en `resumen.tsx`, `clientes/index.tsx`, `clientes/$id.tsx`, `intervenciones.tsx`, `CustomerTable`, `FilterBar` e `InterventionDialog`, más componentes nuevos para señal dominante, timeline e impacto potencial.
