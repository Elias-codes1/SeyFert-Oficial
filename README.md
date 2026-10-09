# SeyFert

Aplicación web académica para consultar un catálogo de belleza y moda, preparar pedidos y administrar el inventario. Proyecto individual.

## Estructura

```text
SeyFert/
├── src/
│   ├── backend/       API REST con Node.js, Express y TypeScript
│   └── frontend/      Interfaz web Angular y TypeScript
├── db/                Esquema, migraciones y datos de muestra PostgreSQL
├── docs/              Alcance, API, modelo de datos, pruebas y diseño
├── package.json       Comandos del workspace
└── pnpm-workspace.yaml
```

## Requisitos

- Node.js 22.22.3 o posterior (o Node.js 24.15 o posterior para Angular 22).
- pnpm 11 (se puede habilitar mediante Corepack).
- PostgreSQL 14 o posterior.

## Preparar PostgreSQL

1. Crea una base vacía llamada `seyfert` (o define otro nombre en el archivo de entorno).
2. Ejecuta `db/SeyFert.sql` en esa base para crear las tablas y datos de demostración.
3. Copia `src/backend/.env.example` como `src/backend/.env` y completa `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `PG_CLAVE` y un `JWT_SECRETO` aleatorio.
4. Crea el usuario administrador desde la raíz con: `pnpm --filter @seyfert/backend crear-admin -- correo clave nombre`.

El archivo `src/backend/.env` contiene secretos locales y no debe incluirse en repositorios ni enviarse en ZIP.

## Instalar y ejecutar

Desde la carpeta raíz del proyecto:

```bash
corepack enable
corepack prepare pnpm@11.10.0 --activate
pnpm install
pnpm dev
```

Angular queda disponible en `http://localhost:4200` y la API en `http://localhost:4001`; el proxy del frontend reenvía `/api` al backend. Para comprobar la API abre `http://localhost:4001/api/health`.

También se pueden iniciar por separado con `pnpm dev:backend` y `pnpm dev:frontend`.

## Comandos

```bash
pnpm build
pnpm --filter @seyfert/backend test
pnpm test:frontend
```

## Documentación

Consulta [`docs/README.md`](docs/README.md). Allí se encuentran alcance, endpoints REST, especificación OpenAPI, ER, diccionario de datos, plan de pruebas y paleta de interfaz. El manual de usuario se añadirá después de estabilizar la aplicación.

## Límites funcionales

El prototipo no procesa pagos. Al crear un pedido se validan y reservan existencias por tiempo limitado; el usuario recibe un enlace para coordinar la solicitud por WhatsApp. Abrir el enlace no confirma entrega del mensaje ni aceptación del pedido.
