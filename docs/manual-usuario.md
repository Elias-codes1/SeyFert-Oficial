# Manual de usuario de SeyFert

## 1. Propósito

SeyFert permite consultar productos de belleza y moda, preparar pedidos para coordinar por WhatsApp y administrar inventario y pedidos. Es un prototipo académico: no cobra en línea ni confirma que un mensaje de WhatsApp haya sido recibido.

## 2. Iniciar el sistema en una computadora local

1. Instalar Node.js, pnpm y PostgreSQL.
2. Crear una base PostgreSQL vacía. Ejecutar `db/SeyFert.sql` en ella una sola vez.
3. Copiar `src/backend/.env.example` a `src/backend/.env`. Ingresar los datos locales de PostgreSQL y un secreto JWT largo y privado.
4. Desde la carpeta raíz ejecutar `pnpm install`.
5. Crear la cuenta administradora con `pnpm --filter @seyfert/backend crear-admin -- correo clave nombre`.
6. Ejecutar `pnpm dev`.
7. Abrir `http://localhost:4200`.

No enviar el archivo `src/backend/.env` a otras personas ni subirlo al repositorio.

## 3. Visitante: consultar el catálogo

En la página inicial se muestran los productos disponibles. Se puede escribir una parte del nombre, elegir categoría, marca y género, indicar precios mínimo y máximo, o limpiar los filtros. Cuando existen varias páginas, se usan los botones **Anterior** y **Siguiente**.

Cada tarjeta presenta nombre, marca, categoría, género, precio y disponibilidad. Los productos agotados no se pueden agregar.

## 4. Carrito y solicitud de pedido

1. Elegir **Agregar al carrito** en uno o más productos.
2. Abrir **Carrito**, revisar las cantidades y el total; ajustar o retirar líneas si hace falta.
3. Completar nombre, teléfono y dirección. Las notas son opcionales.
4. Confirmar el pedido. La API vuelve a comprobar el stock y registra el pedido en estado **PENDIENTE**.
5. Usar el botón/enlace de WhatsApp que aparece para abrir un mensaje ya preparado y coordinar directamente con la tienda.

La creación de la solicitud reserva temporalmente las existencias. La cancelación devuelve el stock. El pedido puede vencer si no se confirma dentro del plazo configurado.

## 5. Crear una cuenta de cliente

1. Abrir **Crear cuenta**.
2. Ingresar nombre, correo válido y contraseña de al menos ocho caracteres.
3. Al registrarse, el sistema inicia la sesión y abre **Mi perfil**.
4. En el perfil se pueden actualizar nombre y correo. Si el correo ya pertenece a otra cuenta, se muestra un error.
5. **Cerrar sesión** termina la sesión local; para acciones protegidas se debe iniciar sesión otra vez.

## 6. Administración

1. Abrir **Iniciar sesión** y entrar con la cuenta ADMIN creada en el paso de configuración.
2. En **Resumen** se muestran los conteos actuales de productos activos, productos con stock bajo, pedidos pendientes y pedidos del mes.
3. **Productos** permite crear, editar, desactivar y reactivar productos. Cada producto requiere categoría, marca, género, precio y stock.
4. **Categorías y marcas** permite crear, renombrar y desactivar elementos. La desactivación es lógica para preservar referencias existentes.
5. **Pedidos** muestra datos de contacto, detalle y total. Los cambios válidos son: PENDIENTE a CONFIRMADO o CANCELADO; CONFIRMADO a ENTREGADO o CANCELADO. Los estados ENTREGADO y CANCELADO son finales.
6. Usar **Cerrar sesión** al terminar.

## 7. Mensajes y solución de problemas

| Situación | Qué revisar |
|---|---|
| No carga el catálogo | Confirmar que PostgreSQL, la API y Angular estén ejecutándose. Comprobar `http://localhost:4001/api/health`. |
| Error al iniciar sesión | Confirmar correo, clave y que la cuenta exista. Para ADMIN, volver a ejecutar el comando de creación con el correo correcto. |
| No se puede guardar un pedido | Revisar cantidades disponibles y los campos obligatorios. El stock se valida de nuevo al enviar. |
| No se ven categorías o marcas | Verificar que estén activas y que la API pueda consultar la base. |
| Acceso denegado a administración | Iniciar con una cuenta ADMIN; los clientes no tienen permisos administrativos. |
| Ruta inexistente | Usar **Volver al catálogo** en la página 404. |

## 8. Datos de demostración

La base inicial incluye categorías, una marca de prueba y un producto de muestra. Se pueden editar desde administración. El número de WhatsApp configurado en `src/frontend/src/app/config.ts` es un dato de demostración y debe cambiarse por el número autorizado del comercio antes de presentar el sistema.
