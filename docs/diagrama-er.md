# Diagrama entidad-relación

```mermaid
erDiagram
  USUARIO ||--o{ HISTORIAL_ESTADO_PEDIDO : registra
  CATEGORIA ||--o{ PRODUCTO : clasifica
  MARCA ||--o{ PRODUCTO : identifica
  PRODUCTO ||--o{ IMAGEN_PRODUCTO : contiene
  PEDIDO ||--|{ DETALLE_PEDIDO : incluye
  PRODUCTO ||--o{ DETALLE_PEDIDO : aparece_en
  PEDIDO ||--|{ HISTORIAL_ESTADO_PEDIDO : conserva

  USUARIO {
    bigint id PK
    varchar nombre
    varchar email UK
    varchar password
    varchar rol
    boolean activo
  }
  CATEGORIA {
    bigint id PK
    varchar nombre UK
    boolean activa
  }
  MARCA {
    bigint id PK
    varchar nombre UK
    boolean activa
  }
  PRODUCTO {
    bigint id PK
    varchar nombre
    text descripcion
    numeric precio
    integer stock
    varchar genero
    boolean activo
    bigint categoria_id FK
    bigint marca_id FK
  }
  IMAGEN_PRODUCTO {
    bigint id PK
    bigint producto_id FK
    varchar url
    integer orden
    boolean principal
  }
  PEDIDO {
    bigint id PK
    varchar nombre_cliente
    varchar telefono
    varchar direccion
    varchar estado
    timestamp fecha
    timestamp vence_en
    numeric total
  }
  DETALLE_PEDIDO {
    bigint id PK
    bigint pedido_id FK
    bigint producto_id FK
    integer cantidad
    numeric precio_unitario
  }
  HISTORIAL_ESTADO_PEDIDO {
    bigint id PK
    bigint pedido_id FK
    bigint usuario_id FK
    varchar estado_anterior
    varchar estado_nuevo
    timestamp fecha
  }
```

El script fuente es [`../db/SeyFert.sql`](../db/SeyFert.sql). La relación entre detalle y producto conserva el precio unitario histórico para que un cambio posterior al precio del catálogo no modifique el total previamente solicitado.
