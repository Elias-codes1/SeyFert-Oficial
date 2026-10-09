# Análisis y alcance del proyecto

## Identificación

- **Sistema:** SeyFert, tienda web de belleza y moda.
- **Autoría:** proyecto individual.
- **Tecnologías implementadas:** Angular y TypeScript para la interfaz; Node.js, Express y TypeScript para la API; PostgreSQL para la persistencia.
- **Tema y relación con ODS:** propuesta de trabajo: uso de herramientas digitales accesibles para apoyar la organización y comercialización de microemprendimientos, vinculada de forma preliminar al ODS 8 (trabajo decente y crecimiento económico). La aprobación del planteamiento por el docente queda pendiente de confirmación; esta relación no se presenta como aprobada.

## Problema y justificación

Los pequeños comercios pueden tener dificultades para mantener actualizado el inventario, presentar su catálogo y dar seguimiento ordenado a los pedidos. SeyFert propone una aplicación web local que centraliza esas tareas y permite que un cliente consulte productos y prepare una solicitud de compra.

La aplicación es un prototipo académico. No procesa pagos ni reemplaza la confirmación directa con el comercio. El pedido se registra en estado pendiente; el cliente puede abrir WhatsApp con un mensaje precargado para coordinarlo.

## Personas usuarias y permisos

| Rol | Acciones |
|---|---|
| Visitante | Consultar catálogo, buscar y filtrar productos, preparar carrito y enviar solicitud de pedido. |
| Cliente | Iniciar sesión, consultar y editar su perfil. |
| Administrador | Gestionar productos, categorías, marcas y estados de pedidos; consultar indicadores. |

El acceso se valida tanto en rutas de Angular como en endpoints protegidos del backend. La protección del cliente evita mostrar pantallas; la API vuelve a comprobar el rol antes de ejecutar operaciones administrativas.

## Alcance funcional

- Catálogo público con búsqueda, filtros por categoría, marca, género y precio, y paginación desde el servidor.
- Carrito local y creación transaccional de pedido con reserva temporal de existencias.
- Enlace de WhatsApp con información del pedido para coordinar la compra.
- Registro, inicio de sesión y perfil de cliente.
- Acceso administrativo y cierre de sesión.
- CRUD y desactivación lógica de productos, categorías y marcas.
- Consulta y transición controlada del estado de pedidos, con historial y devolución de existencias al cancelar.
- Dashboard administrativo con indicadores de productos activos, stock bajo, pedidos pendientes y pedidos del mes.

## Fuera del alcance funcional

- Procesamiento de pagos, facturación electrónica, logística o rastreo de entregas.
- Confirmación automática de que WhatsApp recibió o entregó el mensaje.
- Aplicación móvil nativa.

## Criterios de éxito

1. Un visitante puede encontrar productos con filtros y navegar páginas de resultados.
2. Los pedidos validan existencias y registran detalles, total e historial dentro de transacciones.
3. Un cliente puede crear cuenta e iniciar sesión sin que su contraseña se almacene en texto plano.
4. Un administrador gestiona las entidades cubiertas y cambia pedidos únicamente por transiciones permitidas.
5. La documentación técnica permite instalar, configurar y conocer el modelo de datos y la API.

## Supuestos y riesgos

- La base local necesita PostgreSQL y variables de entorno configuradas por quien ejecuta el proyecto.
- Las imágenes del catálogo se guardan como URL; la carga de archivos no forma parte del prototipo.
- El número de WhatsApp es de ejemplo y debe sustituirse por el número real autorizado antes de presentar una demostración.
- El alcance ODS y la formulación del problema deben validarse con el docente antes de considerarse aprobados.
