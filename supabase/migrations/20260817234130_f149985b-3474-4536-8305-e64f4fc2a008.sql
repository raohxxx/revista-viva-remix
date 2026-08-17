
INSERT INTO public.retention_actions (subscriber_id, action_type, status, owner, notes, scheduled_at, completed_at, outcome, created_at)
SELECT
  s.id,
  (ARRAY['Llamada','Email','Oferta','Contenido personalizado','Soporte de pago','Encuesta'])[1 + (rn % 6)],
  CASE WHEN rn % 7 = 0 THEN 'Pendiente' WHEN rn % 7 = 1 THEN 'Programada' WHEN rn % 7 = 2 THEN 'En curso' ELSE 'Completada' END,
  (ARRAY['C. Morales','J. Fuentes','P. Rivas','M. Toledo'])[1 + (rn % 4)],
  (ARRAY[
    'Cliente indica menor tiempo disponible para lectura.',
    'Se envía selección de contenidos según intereses previos.',
    'Se ofrece descuento de renovación por 3 meses.',
    'Se actualizó el medio de pago tras el rechazo del cobro.',
    'Sin respuesta tras dos intentos de contacto.',
    'Cliente manifiesta disconformidad con la frecuencia de newsletters.'
  ])[1 + (rn % 6)],
  now() - ((rn % 25) || ' days')::interval,
  CASE WHEN rn % 7 >= 3 THEN now() - ((rn % 20) || ' days')::interval ELSE NULL END,
  CASE WHEN rn % 7 >= 3 THEN (ARRAY['Retenido','Retenido','Sin respuesta','Seguimiento pendiente','Canceló'])[1 + (rn % 5)] ELSE NULL END,
  now() - ((rn % 30) || ' days')::interval
FROM (
  SELECT id, row_number() OVER (ORDER BY customer_code) AS rn
  FROM public.subscribers
  ORDER BY customer_code
  LIMIT 48
) s;
