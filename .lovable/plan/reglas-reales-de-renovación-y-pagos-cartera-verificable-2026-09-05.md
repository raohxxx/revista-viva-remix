# Reglas reales de renovación y pagos + cartera verificable

## Situación actual (verificada)

- La tabla de reglas del modelo solo contiene la fila de umbrales (25 / 50 / 75). **No existe ninguna regla de señal**: ni renovación próxima, ni pagos rechazados, ni caída de actividad, inactividad, satisfacción o reclamos. Con esto todos los clientes puntúan 0 de riesgo.
- La cartera está **vacía**: 0 suscriptores, 0 evaluaciones de riesgo y 0 intervenciones. No hay nada que recargar todavía.
- En la ficha de cliente ya se pasan las reglas vigentes a la recomendación, pero la carga de cartera no las devuelve ni las usa al calcular la prioridad, así que la prioridad sigue usando valores por defecto.

## Qué se hará

1. **Crear las seis reglas del modelo** con configuraciones reales y explicables, dando protagonismo a las dos pedidas:
   - Renovación próxima: entra en juego 30 días antes y llega a su máximo a 7 días o menos (peso alto).
   - Pagos rechazados: máximo con 2 o más cobros fallidos en 90 días (peso alto).
   - Además: caída de actividad, inactividad, baja satisfacción y reclamos, con umbrales coherentes.
   - Los pesos activos sumarán 100 puntos, de modo que el puntaje mostrado sea directamente interpretable.
2. **Poblar la cartera de demostración** con ~40 clientes con nombre, email, plan, valor, fechas de renovación repartidas (vencidas, esta semana, este mes, lejanas), historial de pagos fallidos, actividad, satisfacción y reclamos, para que las dos reglas nuevas se noten claramente.
3. **Conectar las reglas al cálculo de prioridad**: la carga de cartera devolverá las reglas vigentes y las usará al puntuar prioridad (hoy no lo hace), igual que ya ocurre con la explicación y la recomendación.
4. **Recalcular y guardar** los puntajes de toda la cartera con esas reglas.
5. **Verificar** que riesgo, prioridad y recomendación reaccionan a las reglas: se compararán los puntajes con la regla de renovación activa y desactivada, y con la de pagos activa y desactivada, revisando además la aplicación en pantalla (resumen, listado de clientes y ficha) para confirmar que el texto explicativo cita la fecha de renovación y los cobros fallidos reales.

## Detalles técnicos

- Datos de reglas y clientes demo: inserciones SQL (no hay cambios de estructura de tablas).
- `fetchPortfolio` expondrá `rules` en su retorno y ambas llamadas a `calculatePriorityScore` (cartera y recálculo) recibirán `config.rules`.
- Verificación con consultas al backend y con un recorrido de la app en navegador; se ejecutan typecheck y build.
