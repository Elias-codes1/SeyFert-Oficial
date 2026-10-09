# Plan de pruebas

## Pruebas manuales de aceptación

| ID | Escenario | Pasos resumidos | Resultado esperado |
|---|---|---|---|
| PM-01 | Catálogo inicial | Abrir la página principal. | Carga de productos activos y estados de carga/error legibles. |
| PM-02 | Búsqueda | Buscar parte del nombre de un producto. | Resultados coincidentes y conteo consistente. |
| PM-03 | Filtros combinados | Elegir categoría, marca, género y rango válido. | API devuelve resultados que cumplen todos los filtros. |
| PM-04 | Rango inválido | Ingresar precio mínimo superior al máximo. | No se presenta un resultado engañoso; API rechaza parámetros inválidos. |
| PM-05 | Paginación | Navegar a página siguiente y volver. | Resultados no se repiten por filtros y los controles respetan límites. |
| PM-06 | Carrito | Agregar producto, cambiar cantidad y quitarlo. | Contador y total se actualizan y persisten localmente. |
| PM-07 | Pedido sin datos | Intentar confirmar con formulario incompleto. | Validaciones impiden enviar y explican campos pendientes. |
| PM-08 | Pedido válido | Confirmar líneas disponibles. | Se crea pedido pendiente, se registra detalle y disminuye stock; se ofrece mensaje de WhatsApp precargado. |
| PM-09 | Stock insuficiente | Solicitar más unidades que las disponibles. | API rechaza la operación y no deja pedido ni decremento parcial. |
| PM-10 | Registro / login | Registrar correo válido, luego iniciar sesión. | Cuenta CLIENTE; clave almacenada como hash y sesión disponible. |
| PM-11 | Aislamiento de roles | Intentar llamar un endpoint ADMIN sin token y con token CLIENTE. | Respuestas 401 y 403 respectivamente; no se modifica información. |
| PM-12 | Perfil | Consultar y editar nombre/correo con sesión de cliente. | Datos se guardan; correo duplicado se rechaza. |
| PM-13 | CRUD administrativo | Crear, editar, desactivar y reactivar producto, categoría y marca. | Cambios se reflejan y las referencias históricas se conservan. |
| PM-14 | Estado de pedido | Confirmar, entregar o cancelar en orden permitido e intentar transición prohibida. | Solo transiciones configuradas; historial actualizado; cancelación devuelve stock una sola vez. |
| PM-15 | Dashboard | Abrir panel ADMIN con datos de prueba. | Indicadores reflejan conteos de la base de datos. |
| PM-16 | Estados vacíos y errores | Probar catálogo vacío, filtro sin coincidencias, API caída y ruta Angular inexistente. | Mensajes distinguibles y ruta 404 con retorno al catálogo. |
| PM-17 | Diseño adaptable | Revisar catálogo, formularios y administración en anchos móvil y escritorio. | Contenido legible, sin desbordamiento horizontal; controles accesibles por teclado. |

## Pruebas automatizadas

La rúbrica pide al menos tres pruebas de backend y dos de frontend. Se implementaron y ejecutaron las pruebas automatizadas listadas en el registro inferior. Las pruebas manuales siguen pendientes de ejecución con PostgreSQL local.

## Registro de ejecución

| Fecha | Comando / caso | Resultado | Observación |
|---|---|---|---|
| 2026-10-09 | Backend: `npm test` | 3 pruebas aprobadas | Compilación TypeScript y reglas puras de pedidos. |
| 2026-10-09 | Frontend: `npm test -- --watch=false` | 4 pruebas aprobadas | Dos archivos: pruebas de aplicación y utilidades del catálogo. |
| 2026-10-09 | Frontend: `ng build` | Bundles compilados | En este entorno, Angular generó bundles pero devolvió EPERM al finalizar directorios SSR. Revisar build local. |
| Pendiente | Casos manuales PM-01 a PM-17 | No ejecutados | Completar con PostgreSQL y sesión local configurados. |
