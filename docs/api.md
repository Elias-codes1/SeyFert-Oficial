# API REST

API local: `http://localhost:4001/api`. Respuestas JSON, UTF-8. Para endpoints privados enviar `Authorization: Bearer <token>`. Los endpoints administrativos requieren rol `ADMIN`; perfil requiere una sesión válida. Las contraseñas se envían solo por HTTPS en ambientes reales; en el entorno local no usar credenciales reales.

## Rutas

| Método | Ruta | Permiso | Descripción |
|---|---|---|---|
| GET | `/health` | Público | Estado de la API. |
| GET | `/productos` | Público | Catálogo; query: `q`, `categoriaId`, `marcaId`, `genero`, `precioMin`, `precioMax`, `page`, `pageSize`. |
| GET | `/productos/admin` | ADMIN | Productos activos e inactivos. |
| POST | `/productos` | ADMIN | Crear producto. |
| PUT | `/productos/{id}` | ADMIN | Editar producto. |
| DELETE | `/productos/{id}` | ADMIN | Desactivar producto. |
| PATCH | `/productos/{id}/activar` | ADMIN | Reactivar producto. |
| GET | `/categorias`, `/marcas` | Público | Listar elementos activos. |
| GET | `/categorias/admin`, `/marcas/admin` | ADMIN | Listar todos, incluidos inactivos. |
| POST | `/categorias`, `/marcas` | ADMIN | Crear elemento de catálogo. |
| PUT | `/categorias/{id}`, `/marcas/{id}` | ADMIN | Cambiar nombre. |
| DELETE | `/categorias/{id}`, `/marcas/{id}` | ADMIN | Desactivar elemento. |
| POST | `/auth/registro` | Público | Registrar cliente; recibe `nombre`, `email`, `clave`. |
| POST | `/auth/login` | Público | Iniciar sesión; recibe `email`, `clave`. |
| GET | `/auth/perfil` | Sesión | Consultar usuario autenticado. |
| PUT | `/auth/perfil` | Sesión | Actualizar `nombre` y `email`. |
| POST | `/pedidos` | Público | Crear pedido transaccional; recibe cliente, contacto, dirección y líneas `{productoId,cantidad}`. |
| GET | `/pedidos` | ADMIN | Listar pedidos y detalles. |
| PATCH | `/pedidos/{id}` | ADMIN | Cambiar estado mediante una transición permitida. |
| GET | `/dashboard` | ADMIN | Indicadores agregados para administración. |

## Respuesta del catálogo

`GET /productos?page=1&pageSize=12` devuelve `{ items, total, page, pageSize, totalPages }`. La API limita `pageSize` a 50 y usa parámetros SQL para los valores de filtros.

## Estados de pedido

`PENDIENTE → CONFIRMADO → ENTREGADO`; desde `PENDIENTE` o `CONFIRMADO` se permite `CANCELADO`. No se permiten cambios desde estados terminales. Crear un pedido reserva stock en una transacción; cancelar lo devuelve en una transacción. Las reservas pendientes vencen y el proceso libera existencias al consultar el catálogo.

## Códigos comunes

- `400`: datos o filtros no válidos / transición no permitida.
- `401`: token faltante, inválido o expirado.
- `403`: rol insuficiente u origen no permitido.
- `404`: recurso o endpoint inexistente.
- `409`: correo duplicado al registrar o editar perfil.
- `500`: error interno; la respuesta no debe revelar credenciales ni SQL.

El contrato implementado está en los controladores y rutas de `backend/src/api/`. La API también expone errores JSON centrales para rutas desconocidas y errores no controlados.
