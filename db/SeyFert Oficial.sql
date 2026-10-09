-- Esquema inicial para una base de datos vacía. No borra ni reinicia datos existentes.

-- 2. Crear las 8 tablas
CREATE TABLE usuario (
    id        BIGSERIAL PRIMARY KEY,
    nombre    VARCHAR(100) NOT NULL,
    email     VARCHAR(150) NOT NULL UNIQUE,
    password  VARCHAR(255) NOT NULL,
    rol       VARCHAR(20)  NOT NULL DEFAULT 'CLIENTE',
    activo    BOOLEAN      NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_usuario_rol CHECK (rol IN ('ADMIN', 'CLIENTE'))
);
CREATE UNIQUE INDEX uq_usuario_email_lower ON usuario (LOWER(email));

CREATE TABLE categoria (
    id      BIGSERIAL PRIMARY KEY,
    nombre  VARCHAR(80) NOT NULL UNIQUE,
    activa  BOOLEAN     NOT NULL DEFAULT TRUE
);

CREATE TABLE marca (
    id      BIGSERIAL PRIMARY KEY,
    nombre  VARCHAR(80) NOT NULL UNIQUE,
    activa  BOOLEAN     NOT NULL DEFAULT TRUE
);

CREATE TABLE producto (
    id              BIGSERIAL PRIMARY KEY,
    nombre          VARCHAR(150)  NOT NULL,
    descripcion     TEXT,
    precio          NUMERIC(10,2) NOT NULL,
    stock           INTEGER       NOT NULL DEFAULT 0,
    genero          VARCHAR(20)   NOT NULL,
    activo          BOOLEAN       NOT NULL DEFAULT TRUE,
    fecha_creacion  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    categoria_id    BIGINT        NOT NULL REFERENCES categoria(id),
    marca_id        BIGINT        NOT NULL REFERENCES marca(id),
    CONSTRAINT chk_producto_precio CHECK (precio >= 0),
    CONSTRAINT chk_producto_stock  CHECK (stock >= 0),
    CONSTRAINT chk_producto_genero CHECK (genero IN ('DAMA', 'CABALLERO', 'UNISEX'))
);
CREATE INDEX idx_producto_categoria  ON producto(categoria_id);
CREATE INDEX idx_producto_marca      ON producto(marca_id);
CREATE INDEX idx_producto_genero     ON producto(genero);
CREATE INDEX idx_producto_precio     ON producto(precio);
CREATE INDEX idx_producto_activos    ON producto(categoria_id, precio) WHERE activo = TRUE;
CREATE INDEX idx_producto_stock_bajo ON producto(stock) WHERE activo = TRUE;

CREATE TABLE imagen_producto (
    id           BIGSERIAL PRIMARY KEY,
    producto_id  BIGINT       NOT NULL REFERENCES producto(id) ON DELETE CASCADE,
    url          VARCHAR(500) NOT NULL,
    orden        INTEGER      NOT NULL DEFAULT 0,
    principal    BOOLEAN      NOT NULL DEFAULT FALSE
);
CREATE INDEX idx_imagen_producto ON imagen_producto(producto_id);
CREATE UNIQUE INDEX uq_imagen_principal ON imagen_producto(producto_id) WHERE principal = TRUE;

CREATE TABLE pedido (
    id              BIGSERIAL PRIMARY KEY,
    nombre_cliente  VARCHAR(120)  NOT NULL,
    telefono        VARCHAR(20)   NOT NULL,
    direccion       VARCHAR(255)  NOT NULL,
    notas           VARCHAR(500),
    fecha           TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado          VARCHAR(20)   NOT NULL DEFAULT 'PENDIENTE',
    vence_en        TIMESTAMP,
    total           NUMERIC(10,2) NOT NULL,
    CONSTRAINT chk_pedido_estado CHECK (estado IN ('PENDIENTE','CONFIRMADO','ENTREGADO','CANCELADO')),
    CONSTRAINT chk_pedido_total  CHECK (total >= 0)
);
CREATE INDEX idx_pedido_estado ON pedido(estado);
CREATE INDEX idx_pedido_fecha  ON pedido(fecha DESC);
CREATE INDEX idx_pedido_vence  ON pedido(vence_en) WHERE estado = 'PENDIENTE';

CREATE TABLE detalle_pedido (
    id               BIGSERIAL PRIMARY KEY,
    pedido_id        BIGINT        NOT NULL REFERENCES pedido(id) ON DELETE CASCADE,
    producto_id      BIGINT        NOT NULL REFERENCES producto(id),
    cantidad         INTEGER       NOT NULL,
    precio_unitario  NUMERIC(10,2) NOT NULL,
    CONSTRAINT chk_detalle_cantidad CHECK (cantidad > 0),
    CONSTRAINT chk_detalle_precio   CHECK (precio_unitario >= 0),
    CONSTRAINT uq_detalle_pedido_producto UNIQUE (pedido_id, producto_id)
);
CREATE INDEX idx_detalle_pedido   ON detalle_pedido(pedido_id);
CREATE INDEX idx_detalle_producto ON detalle_pedido(producto_id);

CREATE TABLE historial_estado_pedido (
    id               BIGSERIAL PRIMARY KEY,
    pedido_id        BIGINT      NOT NULL REFERENCES pedido(id) ON DELETE CASCADE,
    estado_anterior  VARCHAR(20),
    estado_nuevo     VARCHAR(20) NOT NULL,
    nota             VARCHAR(200),
    fecha            TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    usuario_id       BIGINT      REFERENCES usuario(id),
    CONSTRAINT chk_hist_anterior CHECK (estado_anterior IS NULL OR
        estado_anterior IN ('PENDIENTE','CONFIRMADO','ENTREGADO','CANCELADO')),
    CONSTRAINT chk_hist_nuevo CHECK
        (estado_nuevo IN ('PENDIENTE','CONFIRMADO','ENTREGADO','CANCELADO'))
);
CREATE INDEX idx_historial_pedido ON historial_estado_pedido(pedido_id, fecha);

-- 3. Datos iniciales
INSERT INTO categoria (nombre) VALUES ('Perfumes'), ('Ropa'), ('Maquillaje'), ('Accesorios');

-- 4. Producto de prueba
INSERT INTO marca (nombre) VALUES ('Marca de prueba');

INSERT INTO producto (nombre, descripcion, precio, stock, genero, categoria_id, marca_id)
VALUES ('Perfume de prueba', 'Producto para probar', 150.00, 10, 'UNISEX', 1, 1);

-- 5. Verificar tablas
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' ORDER BY table_name;


