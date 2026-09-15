# Remix of Viva Retention Guard

Construye un sistema profesional y funcional de detección de churn para RevistaViva

Quiero que construyas una aplicación web SaaS interna, completamente funcional, para el equipo de Retención de una empresa ficticia llamada RevistaViva, un medio digital por suscripción de Chile.

El producto debe permitir identificar suscriptores con riesgo de abandonar, explicar por qué tienen ese riesgo, priorizar a quién contactar y registrar las acciones de retención realizadas.

IMPORTANTE

No quiero:

una landing page;

un prototipo visual estático;

botones que no funcionen;

gráficos decorativos sin conexión con los datos;

datos escritos directamente dentro de los componentes;

Lorem Ipsum;

páginas que parezcan funcionales pero no tengan lógica detrás.

Quiero una aplicación interna real, estilo SaaS B2B, profesional y presentable en una demo ante ejecutivos o reclutadores.

Todas las funciones principales deben funcionar.

1. Objetivo del sistema

La aplicación debe responder rápidamente estas preguntas:

¿Cuántos clientes están actualmente en riesgo?

¿Qué clientes tienen mayor probabilidad de churn?

¿Por qué cada cliente está en riesgo?

¿Cuándo renueva?

¿Qué señales están aumentando su riesgo?

¿Qué acción de retención conviene realizar?

¿Ya fue contactado?

¿Qué acciones de retención se realizaron?

¿Funcionaron esas acciones?

¿Cuánto ingreso potencial estamos protegiendo?

El objetivo NO es construir el modelo de Machine Learning más sofisticado.

El objetivo es:

detectar riesgo → explicar las causas → priorizar clientes → ejecutar acciones → medir resultados.

2. Stack

Construir la aplicación utilizando:

Frontend

React.

TypeScript.

Tailwind CSS.

shadcn/ui.

Recharts para visualizaciones.

Lucide Icons.

Backend y persistencia

Utilizar Supabase para:

PostgreSQL;

autenticación;

persistencia;

consultas;

Row Level Security cuando corresponda.

La aplicación debe estar estructurada para que posteriormente podamos reemplazar el sistema heurístico por un modelo de Machine Learning o API externa sin tener que reconstruir el frontend.

Mantén una arquitectura limpia, modular y escalable.

3. Nombre del producto

Dentro de la aplicación utilizar:

RevistaViva Retention Intelligence

Subtítulo:

Detección temprana de riesgo de fuga

No crear página comercial.

Esta es una herramienta interna utilizada por el área de Retención.

4. Diseño visual

Quiero un diseño inspirado en productos B2B modernos como:

Stripe Dashboard;

Linear;

Vercel;

HubSpot;

Intercom;

modernos dashboards de analytics.

Pero NO copies ninguna interfaz.

Estética

Debe sentirse:

premium;

seria;

limpia;

ejecutiva;

tecnológica;

minimalista;

orientada a datos.

Evitar:

gradientes exagerados;

demasiados colores;

sombras excesivas;

tarjetas gigantes;

exceso de bordes;

estética de proyecto universitario;

elementos visuales innecesarios.

Layout

Sidebar izquierda persistente.

Header superior limpio.

Contenido principal con buen uso del espacio.

Desktop-first, pero responsive.

Colores de riesgo

Utilizar de forma consistente:

Bajo → verde.

Medio → amarillo/ámbar.

Alto → naranja.

Crítico → rojo.

No colorear toda la interfaz.

Los colores de riesgo deben utilizarse principalmente para comunicar estado.

5. Navegación principal

Sidebar:

Resumen

Clientes

Intervenciones

Análisis

Importar datos

Configuración

En la parte inferior:

usuario;

configuración;

cerrar sesión.

Todos los elementos de navegación deben funcionar.

6. Autenticación

Implementar autenticación mediante Supabase.

Crear:

pantalla de login;

sesión persistente;

logout;

rutas protegidas.

Para la demo debe ser posible crear/iniciar sesión con un usuario.

No mostrar información del dashboard sin autenticación.

7. Modelo de datos

Crear una estructura de datos limpia.

Tabla: subscribers

Campos sugeridos:

id

customer_code

subscription_status

plan

subscription_start_date

renewal_date

monthly_value

payment_method

last_access_at

sessions_30d

sessions_previous_30d

articles_read_30d

articles_read_previous_30d

avg_read_time_minutes

newsletter_open_rate

payment_failures_90d

complaints_90d

satisfaction_score

renewal_intent_score

created_at

updated_at

Usar customer_code como identificador visible.

Ejemplo:

RV-10482

Evitar utilizar nombres reales de personas.

Tabla: risk_assessments

Campos:

id

subscriber_id

risk_score

risk_level

principal_reason

contributing_signals

recommended_action

calculated_at

contributing_signals puede utilizar JSONB.

Debe almacenar qué señales contribuyeron al score y cuánto aportó cada una.

Tabla: retention_actions

Campos:

id

subscriber_id

action_type

status

owner

notes

scheduled_at

completed_at

outcome

created_at

Estados posibles:

Pendiente

Programada

En curso

Completada

Resultados posibles:

Retenido

Canceló

Sin respuesta

Seguimiento pendiente

Tabla: risk_rules

Campos:

id

rule_key

name

description

enabled

weight

configuration

created_at

updated_at

La configuración de las reglas debe ser editable.

8. Datos demo

RevistaViva es una empresa ficticia y NO contamos todavía con datos reales.

Por lo tanto:

Genera aproximadamente 150 suscriptores sintéticos exclusivamente para demostrar el funcionamiento del sistema.

MUY IMPORTANTE:

Los datos deben identificarse visualmente como:

Datos de demostración / datos sintéticos

Nunca presentarlos como información real de RevistaViva.

Crear variedad suficiente para tener clientes:

de bajo riesgo;

riesgo medio;

alto riesgo;

críticos;

con actividad creciente;

con actividad decreciente;

con pagos fallidos;

próximos a renovar;

con baja satisfacción;

con reclamos;

con distintas antigüedades.

Los datos deben ser coherentes matemáticamente.

9. Motor de Risk Score

Construir un motor heurístico explicable con puntaje:

0 a 100

No presentar los pesos iniciales como pesos reales de RevistaViva.

Son solamente valores de demostración que posteriormente serán calibrados con datos históricos.

Crear inicialmente estas reglas:

Caída importante de actividad

Si la actividad de los últimos 30 días disminuyó significativamente respecto de los 30 días anteriores:

aporte máximo:

25 puntos

Tiempo desde último acceso

Si lleva muchos días sin ingresar:

aporte máximo:

15 puntos

Problemas de pago

Si existen pagos rechazados durante los últimos 90 días:

aporte máximo:

20 puntos

Renovación próxima

Si la fecha de renovación se encuentra cercana:

aporte máximo:

15 puntos

Baja satisfacción

Si el satisfaction_score es bajo:

aporte máximo:

15 puntos

Reclamos recientes

Si existen reclamos recientes:

aporte máximo:

10 puntos

La suma máxima es:

100 puntos

El cálculo debe implementarse realmente en código.

NO guardar simplemente números aleatorios de risk score.

El Risk Score debe derivarse de los datos del suscriptor.

10. Categorías de riesgo

Clasificación inicial:

0–24 → Bajo

25–49 → Medio

50–74 → Alto

75–100 → Crítico

Estos umbrales deben estar identificados como:

Configuración inicial pendiente de validación con datos reales.

11. Explicabilidad

Esta característica es MUY importante.

No basta con mostrar:

Riesgo: 78

La aplicación debe explicar el resultado.

Ejemplo:

Riesgo alto — 78/100

Principales señales

Caída de actividad
-42% respecto del período anterior
+25 puntos

Último acceso
12 días sin actividad
+13 puntos

Renovación
Renueva en 11 días
+15 puntos

Pago
1 intento rechazado
+20 puntos

Debe ser evidente cómo se construyó el puntaje.

Idealmente incluir una visualización del aporte de cada señal.

12. Recomendaciones automáticas

Crear un motor sencillo de recomendaciones basado en la principal causa detectada.

Ejemplos:

Caída de actividad

Recomendación:

Enviar selección personalizada de contenidos relevantes.

Sensibilidad/precio o baja percepción de valor

Recomendación:

Reforzar beneficios de la suscripción o evaluar incentivo de renovación.

Pago rechazado

Recomendación:

Contactar para actualizar el medio de pago.

Reclamo reciente

Recomendación:

Contacto personalizado desde Retención.

Renovación próxima + riesgo elevado

Recomendación:

Intervención prioritaria antes de la renovación.

Baja satisfacción

Recomendación:

Contactar para comprender la causa de insatisfacción.

Mostrar claramente:

Recomendación generada a partir de señales observadas. Debe ser validada por el equipo de Retención.

No presentar la recomendación como una decisión automática obligatoria.

13. Pantalla: Resumen

Esta debe ser la pantalla principal.

Header:

Resumen de Retención

Subtexto:

Vista general del riesgo de fuga de suscriptores

Agregar indicador discreto:

Datos demo

KPIs superiores

Mostrar:

Suscriptores activos

Número total.

Comparación opcional con período anterior.

Clientes en alto riesgo

Clientes Alto + Crítico.

Mostrar porcentaje sobre el total.

Clientes críticos

Número de clientes con score ≥75.

Churn observado

Si existen datos históricos demo.

Ingreso mensual en riesgo

Suma del valor mensual de clientes Alto + Crítico.

Renovaciones próximas

Número de clientes que renuevan durante los próximos 30 días.

14. Visualizaciones del dashboard

Agregar:

Distribución de riesgo

Gráfico mostrando:

Bajo.

Medio.

Alto.

Crítico.

Evolución del riesgo

Gráfico temporal para mostrar:

clientes de alto riesgo;

clientes críticos;

evolución histórica.

Si no existe histórico suficiente, generar registros demo coherentes.

Principales señales de riesgo

Ranking visual:

Caída de actividad.

Inactividad prolongada.

Pago rechazado.

Renovación próxima.

Baja satisfacción.

Reclamos.

Mostrar cantidad de clientes afectados.

15. Panel: clientes que requieren atención

En el dashboard incluir:

Prioridad de hoy

Mostrar aproximadamente 5 clientes ordenados por:

Risk Score.

Cercanía de renovación.

Ausencia de intervención reciente.

Columnas:

Cliente.

Score.

Riesgo.

Renovación.

Principal señal.

Acción.

Botón:

Ver cliente

Debe navegar realmente al perfil correspondiente.

16. Pantalla: Clientes

Crear una tabla profesional y completamente funcional.

Columnas:

Cliente.

Plan.

Antigüedad.

Score.

Riesgo.

Próxima renovación.

Última actividad.

Variación actividad.

Principal señal.

Estado intervención.

Permitir:

buscar;

ordenar;

filtrar;

paginar.

17. Filtros

Implementar filtros combinables:

Nivel de riesgo

Todos.

Bajo.

Medio.

Alto.

Crítico.

Renovación

Próximos 7 días.

Próximos 15 días.

Próximos 30 días.

Más de 30 días.

Plan

Según los planes sintéticos disponibles.

Intervención

Sin intervención.

Pendiente.

Completada.

Principal señal

Actividad.

Inactividad.

Pago.

Renovación.

Satisfacción.

Reclamo.

Agregar:

Limpiar filtros

Mostrar cantidad de resultados.

18. Tabla interactiva

Permitir ordenar por:

score;

renovación;

última actividad;

caída de actividad;

valor mensual.

Los clientes críticos deben ser fáciles de detectar sin hacer que la tabla sea visualmente agresiva.

Al hacer click en cualquier fila:

abrir:

/clientes/:id

19. Pantalla: Perfil del cliente

Esta debe ser una de las pantallas visualmente más importantes.

Header:

Cliente RV-XXXXX

Mostrar:

plan;

antigüedad;

fecha de renovación;

valor de suscripción;

estado.

20. Hero de riesgo

Mostrar claramente:

RIESGO ALTO

78 / 100

Agregar una barra o visualización elegante del score.

Agregar:

Principal factor

Ejemplo:

Reducción significativa de actividad.

21. Explicación del score

Crear sección:

¿Por qué está en riesgo?

Mostrar cada señal.

Ejemplo:

Actividad

Últimos 30 días:

12 sesiones

Período anterior:

25 sesiones

Variación:

-52%

Impacto:

+25 pts

Último acceso

Hace:

12 días

Impacto:

+13 pts

Pago

1 pago rechazado.

Impacto:

+20 pts

La suma de las contribuciones debe coincidir con el Risk Score mostrado.

22. Comportamiento del cliente

Agregar una sección visual con métricas:

sesiones;

artículos leídos;

tiempo de lectura;

apertura de newsletter;

último acceso.

Comparar cuando sea posible:

Últimos 30 días vs 30 días anteriores

Agregar gráfico pequeño de tendencia.

23. Renovación

Crear una tarjeta:

Próxima renovación

Mostrar:

fecha;

días restantes;

plan;

valor;

historial relevante.

Si faltan menos de 15 días y el cliente está Alto/Crítico, destacar:

Intervención recomendada antes de renovación

24. Acción recomendada

Crear una sección destacada:

Acción sugerida

Ejemplo:

Contacto personalizado + recomendación de contenido

Motivo:

El cliente redujo su actividad un 52% y renueva en 12 días.

Agregar botón:

Crear intervención

Este botón DEBE funcionar.

25. Crear intervención

Al hacer click abrir modal o drawer.

Campos:

Tipo de acción

Email.

Llamada.

Encuesta.

Oferta.

Contenido personalizado.

Soporte de pago.

Otro.

Responsable

Texto o selector.

Fecha

Nota

Estado

Al guardar:

crear registro real en retention_actions.

Mostrar toast de confirmación.

Actualizar automáticamente el historial del cliente.

26. Historial del cliente

Mostrar timeline:

Historial de intervenciones

Ejemplo:

15 ago 2026
Llamada
Completada
Cliente manifestó baja frecuencia de lectura.

10 ago 2026
Email
Sin respuesta.

Permitir actualizar una intervención.

27. Registrar resultado

Una intervención completada debe permitir seleccionar:

Retenido.

Canceló.

Sin respuesta.

Seguimiento pendiente.

Esto será utilizado posteriormente para calcular efectividad.

28. Pantalla: Intervenciones

Crear una vista operacional para el equipo de Retención.

KPIs:

Pendientes.

Programadas hoy.

Completadas.

Clientes retenidos.

Tabla:

Cliente.

Riesgo.

Acción.

Responsable.

Fecha.

Estado.

Resultado.

Filtros:

responsable;

estado;

tipo de acción;

riesgo.

Permitir abrir cliente.

Permitir editar intervención.

29. Pantalla: Análisis

Crear una sección más analítica.

Mostrar:

Funnel de riesgo

Total suscriptores
→ clientes en riesgo
→ clientes intervenidos
→ retenidos

Efectividad de intervenciones

Calcular:

Retention Action Effectiveness

clientes retenidos después de intervención / clientes intervenidos con resultado conocido

Mostrar claramente que en la demo se utilizan datos sintéticos.

Efectividad por acción

Tabla o gráfico:

AcciónIntervencionesRetenidosEfectividad

Ejemplos:

Llamada.

Email.

Oferta.

Contenido.

Pago.

Calcular a partir de datos reales almacenados en Supabase.

No hardcodear los resultados.

30. Métricas adicionales

Mostrar cuando los datos permitan calcularlas:

clientes recuperados;

ingreso mensual retenido;

ingreso en riesgo;

tasa de intervención;

clientes críticos contactados;

efectividad por acción.

31. Pantalla: Importar datos

Crear una interfaz para importar CSV.

Debe permitir al usuario:

seleccionar archivo;

previsualizar datos;

validar columnas;

identificar errores;

confirmar importación.

Campos mínimos esperados:

customer_code;

plan;

subscription_start_date;

renewal_date;

monthly_value;

last_access_at;

sessions_30d;

sessions_previous_30d;

articles_read_30d;

articles_read_previous_30d;

payment_failures_90d;

complaints_90d;

satisfaction_score.

Si faltan columnas:

mostrar claramente cuáles.

No romper la aplicación.

Después de importar:

calcular Risk Score.

Mostrar:

X clientes importados correctamente

y

X registros con errores

Nunca modificar silenciosamente datos inválidos.

32. Configuración del Risk Score

Crear página:

Configuración → Modelo de riesgo

Mostrar las reglas activas.

Ejemplo:

SeñalPeso máximoEstadoCaída de actividad25ActivaÚltimo acceso15ActivaProblemas de pago20ActivaRenovación próxima15ActivaBaja satisfacción15ActivaReclamos10Activa

Permitir:

activar/desactivar;

cambiar pesos;

modificar umbrales.

Mostrar siempre:

Configuración experimental. Los pesos deben calibrarse utilizando datos históricos reales de RevistaViva.

33. Recalcular modelo

Agregar botón:

Recalcular Risk Scores

Debe:

leer todos los clientes;

aplicar reglas actuales;

recalcular puntajes;

actualizar categorías;

actualizar razones;

actualizar recomendaciones;

persistir resultados.

Mostrar confirmación:

Scores actualizados correctamente

34. Lógica de actividad

Calcular cambio porcentual:

activity_change = ((sessions_30d - sessions_previous_30d) / sessions_previous_30d) * 100

Manejar correctamente división por cero.

No generar Infinity, NaN ni errores visuales.

El mismo principio debe aplicarse a artículos leídos cuando corresponda.

35. Priorización

Crear un campo o cálculo:

Priority Score

que considere al menos:

Risk Score.

Cercanía de renovación.

Si ya existe intervención.

Valor económico del cliente.

Este indicador puede utilizarse internamente para ordenar la lista de atención.

No confundirlo con el Risk Score.

Mostrar Risk Score como riesgo de churn.

Mostrar Prioridad como prioridad operacional.

36. Estados vacíos

Diseñar buenos empty states.

Ejemplo:

No existen clientes críticos

Actualmente ningún suscriptor cumple las reglas configuradas para riesgo crítico.

No mostrar páginas rotas o tablas vacías sin explicación.

37. Loading y errores

Todas las consultas deben tener:

loading state;

empty state;

error state.

Utilizar skeletons cuando corresponda.

Errores deben mostrarse de manera comprensible.

38. UX profesional

Agregar:

breadcrumbs donde sean útiles;

tooltips para conceptos como Risk Score;

estados hover;

feedback después de acciones;

confirmaciones;

toasts;

filtros persistentes cuando tenga sentido.

No sobrecargar la interfaz.

39. Definiciones mediante tooltip

Risk Score

Puntaje experimental de 0 a 100 que resume señales asociadas a riesgo de abandono.

Riesgo crítico

Cliente cuyo puntaje supera el umbral crítico configurado.

Ingreso en riesgo

Valor de suscripción asociado a clientes clasificados como Alto o Crítico.

Principal señal

Factor que actualmente aporta mayor cantidad de puntos al Risk Score.

40. Privacidad

Evitar información personal innecesaria.

Usar identificadores anonimizados como:

RV-10254

El prototipo no necesita:

RUT;

domicilio;

teléfono;

información sensible.

No incluir datos personales reales.

41. Separar lógica del frontend

Crear una capa clara para el scoring.

Por ejemplo:

src/services/riskEngine.ts

o estructura equivalente.

Debe existir una función similar conceptualmente a:

calculateRiskScore(subscriber, rules)

que retorne:

score;

level;

contributingSignals;

principalReason;

recommendedAction.

No distribuir esta lógica arbitrariamente entre componentes visuales.

42. Preparar arquitectura para ML futuro

El frontend NO debe depender directamente de las reglas heurísticas.

Diseña la solución de modo que posteriormente podamos reemplazar:

riskEngine

por:

POST /api/predict-churn

y recibir una respuesta como:

{
  "score": 78,
  "level": "high",
  "signals": [],
  "recommendedAction": ""
}


sin reconstruir la aplicación.

43. Componentes reutilizables

Crear componentes como:

RiskBadge

RiskScore

MetricCard

CustomerTable

RiskSignals

RetentionActionCard

InterventionTimeline

FilterBar

EmptyState

PageHeader

Evitar duplicación innecesaria.

44. Formato local

Idioma completo de la UI:

Español

Formato de fechas:

DD/MM/YYYY

Moneda:

CLP

Usar textos naturales para Chile.

45. Demo inicial

Cuando se abra el dashboard debe sentirse inmediatamente como un producto funcional.

Un usuario debe poder realizar este flujo completo:

Flujo demo

Entrar al sistema.

Ver número de clientes críticos.

Ir a Clientes.

Filtrar Riesgo = Crítico.

Abrir un cliente.

Entender por qué tiene score 82/100.

Revisar su evolución.

Ver que renueva próximamente.

Leer la acción recomendada.

Crear una intervención.

Marcarla como completada.

Registrar que el cliente fue retenido.

Volver a Análisis.

Ver actualizadas las métricas de intervenciones.

Este flujo DEBE funcionar de extremo a extremo.

46. No generar funcionalidades falsas

Si incluyes:

botones;

menús;

filtros;

modales;

selects;

acciones;

deben tener comportamiento real.

Si una funcionalidad todavía no está implementada:

NO crear un botón falso simulándola.

Prefiero menos funcionalidades completamente operativas antes que muchas funcionalidades visuales que no hacen nada.

47. Calidad del código

Utilizar:

TypeScript correctamente;

interfaces/tipos;

componentes pequeños;

estructura modular;

nombres descriptivos;

funciones reutilizables;

manejo de errores;

separación entre UI, datos y lógica de negocio.

Evitar archivos gigantes.

Evitar componentes de cientos de líneas si pueden dividirse.

48. Criterios de aceptación

Antes de considerar terminado el MVP verifica:

Login funciona.

Logout funciona.

Supabase guarda información.

Dashboard consulta datos reales de la base.

Risk Score se calcula mediante reglas.

Los scores no son aleatorios.

El score está entre 0 y 100.

La suma de señales coincide con el score.

Cada cliente tiene una explicación.

Cada cliente tiene una recomendación.

La tabla de clientes funciona.

La búsqueda funciona.

Los filtros funcionan.

El ordenamiento funciona.

La vista individual funciona.

Crear intervención funciona.

Actualizar intervención funciona.

Registrar resultado funciona.

Métricas se recalculan.

Reglas pueden modificarse.

Scores pueden recalcularse.

La importación CSV valida los datos.

Existen loading states.

Existen error states.

Existen empty states.

No existen botones muertos.

No existen datos personales reales.

Los datos sintéticos están identificados como demo.

La aplicación funciona correctamente en desktop.

La aplicación es responsive.

No hay errores en consola relevantes.

No hay componentes visualmente rotos.

49. Prioridades

Si necesitas priorizar el desarrollo, sigue EXACTAMENTE este orden:

PRIORIDAD 1

Base de datos + autenticación + modelo de datos.

PRIORIDAD 2

Motor funcional de Risk Score.

PRIORIDAD 3

Dashboard.

PRIORIDAD 4

Tabla de clientes.

PRIORIDAD 5

Perfil individual + explicabilidad.

PRIORIDAD 6

Intervenciones.

PRIORIDAD 7

Métricas de efectividad.

PRIORIDAD 8

Configuración de reglas.

PRIORIDAD 9

Importación CSV.

PRIORIDAD 10

Pulido visual y responsive.

No sacrifiques funcionalidad básica para agregar características secundarias.

50. Resultado esperado

Quiero terminar con un MVP que pueda mostrar en una presentación y decir:

“Este sistema identifica automáticamente qué suscriptores muestran señales tempranas de fuga, explica por qué están en riesgo, prioriza a quién debe contactar Retención y permite medir si las intervenciones realmente funcionan.”

Debe sentirse como el comienzo de un producto SaaS real y no como un dashboard académico.

Construye el sistema completo siguiendo esta especificación.

Cuando tengas que escoger entre una implementación visualmente impresionante y una implementación realmente funcional, prioriza:

funcionalidad + claridad + calidad del producto.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://revista-viva-remix.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ffd0f544-0be4-42b0-a442-783abc2abaa2).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
