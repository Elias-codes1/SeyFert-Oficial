# Diccionario de datos

Motor: PostgreSQL. Todas las claves primarias son `BIGSERIAL`; las claves foráneas y restricciones se definen en `db/SeyFert.sql`.

| Tabla | Campo | Tipo | Regla / propósito |
|---|---|---|---|
| usuario | id | BIGSERIAL | PK. |
| usuario | nombre | VARCHAR(100) | Obligatorio. |
| usuario | email | VARCHAR(150) | Obligatorio; único sin distinguir mayúsculas/minúsculas mediante índice. |
| usuario | password | VARCHAR(255) | Hash bcrypt; nunca almacenar contraseña plana. |
| usuario | rol | VARCHAR(20) | ADMIN o CLIENTE. |
| usuario | activo | BOOLEAN | Estado de la cuenta. |
| categoria | id | BIGSERIAL | PK. |
| categoria | nombre | VARCHAR(80) | Obligatorio y único. |
| categoria | activa | BOOLEAN | Permite desactivar sin borrar referencias históricas. |
| marca | id | BIGSERIAL | PK. |
| marca | nombre | VARCHAR(80) | Obligatorio y único. |
| marca | activa | BOOLEAN | Permite desactivar sin borrar referencias históricas. |
| producto | id | BIGSERIAL | PK. |
| producto | nombre | VARCHAR(150) | Obligatorio. |
| producto | descripcion | TEXT | Opcional. |
| producto | precio | NUMERIC(10,2) | No negativo. |
| producto | stock | INTEGER | No negativo. |
| producto | genero | VARCHAR(20) | DAMA, CABALLERO o UNISEX. |
| producto | activo | BOOLEAN | Baja lógica del catálogo. |
| producto | fecha_creacion | TIMESTAMP | Fecha de creación automática. |
| producto | categoria_id | BIGINT | FK a categoria. |
| producto | marca_id | BIGINT | FK a marca. |
| imagen_producto | id | BIGSERIAL | PK. |
| imagen_producto | producto_id | BIGINT | FK a producto; borrado en cascada. |
| imagen_producto | url | VARCHAR(500) | Dirección de la imagen. |
| imagen_producto | orden | INTEGER | Orden de presentación. |
| imagen_producto | principal | BOOLEAN | Como máximo una imagen principal por producto. |
| pedido | id | BIGSERIAL | PK. |
| pedido | nombre_cliente | VARCHAR(120) | Nombre indicado al solicitar. |
| pedido | telefono | VARCHAR(20) | Teléfono de contacto. |
| pedido | direccion | VARCHAR(255) | Dirección indicada para coordinar. |
| pedido | notas | VARCHAR(500) | Opcional. |
| pedido | fecha | TIMESTAMP | Fecha de creación automática. |
| pedido | estado | VARCHAR(20) | PENDIENTE, CONFIRMADO, ENTREGADO o CANCELADO. |
| pedido | vence_en | TIMESTAMP | Vencimiento de la reserva temporal de stock. |
| pedido | total | NUMERIC(10,2) | Total no negativo calculado en backend. |
| detalle_pedido | id | BIGSERIAL | PK. |
| detalle_pedido | pedido_id | BIGINT | FK a pedido; borrado en cascada. |
| detalle_pedido | producto_id | BIGINT | FK a producto. |
| detalle_pedido | cantidad | INTEGER | Entero mayor que cero. |
| detalle_pedido | precio_unitario | NUMERIC(10,2) | Precio capturado al crear el pedido. |
| historial_estado_pedido | id | BIGSERIAL | PK. |
| historial_estado_pedido | pedido_id | BIGINT | FK a pedido; borrado en cascada. |
| historial_estado_pedido | usuario_id | BIGINT | FK opcional al administrador que realizó el cambio. |
| historial_estado_pedido | estado_anterior | VARCHAR(20) | Nulo para el evento inicial. |
| historial_estado_pedido | estado_nuevo | VARCHAR(20) | Estado resultante validado. |
| historial_estado_pedido | nota | VARCHAR(200) | Detalle opcional del evento. |
| historial_estado_pedido | fecha | TIMESTAMP | Fecha del evento automática. |

## Índices y normalización

El esquema separa usuarios, catálogos, productos, pedidos, detalles e historial para evitar repetir datos de producto y de categoría en cada fila. `detalle_pedido.precio_unitario` es una copia histórica intencional. Se indexan las claves foráneas, filtros de producto, estado y fecha de pedido, vencimiento de pedidos pendientes e historial por pedido y fecha. Hay restricciones `CHECK`, unicidad e integridad referencial descritas en el SQL.
