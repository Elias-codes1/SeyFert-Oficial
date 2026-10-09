-- Ejecutar una sola vez en una base creada con la versión anterior del esquema.
ALTER TABLE usuario DROP CONSTRAINT IF EXISTS chk_usuario_rol;
ALTER TABLE usuario ADD CONSTRAINT chk_usuario_rol CHECK (rol IN ('ADMIN', 'CLIENTE'));
ALTER TABLE usuario ALTER COLUMN rol SET DEFAULT 'CLIENTE';
CREATE UNIQUE INDEX IF NOT EXISTS uq_usuario_email_lower ON usuario (LOWER(email));

-- Alinea el flujo de pedidos con los estados visibles en el panel.
ALTER TABLE pedido DROP CONSTRAINT IF EXISTS chk_pedido_estado;
ALTER TABLE historial_estado_pedido DROP CONSTRAINT IF EXISTS chk_hist_anterior;
ALTER TABLE historial_estado_pedido DROP CONSTRAINT IF EXISTS chk_hist_nuevo;
UPDATE pedido SET estado = 'PENDIENTE' WHERE estado = 'RESERVADO';
UPDATE historial_estado_pedido SET estado_anterior = 'PENDIENTE' WHERE estado_anterior = 'RESERVADO';
UPDATE historial_estado_pedido SET estado_nuevo = 'PENDIENTE' WHERE estado_nuevo = 'RESERVADO';
ALTER TABLE pedido ADD CONSTRAINT chk_pedido_estado CHECK (estado IN ('PENDIENTE','CONFIRMADO','ENTREGADO','CANCELADO'));
ALTER TABLE historial_estado_pedido ADD CONSTRAINT chk_hist_anterior CHECK (
  estado_anterior IS NULL OR estado_anterior IN ('PENDIENTE','CONFIRMADO','ENTREGADO','CANCELADO')
);
ALTER TABLE historial_estado_pedido ADD CONSTRAINT chk_hist_nuevo CHECK (
  estado_nuevo IN ('PENDIENTE','CONFIRMADO','ENTREGADO','CANCELADO')
);
DROP INDEX IF EXISTS idx_pedido_vence;
CREATE INDEX idx_pedido_vence ON pedido(vence_en) WHERE estado = 'PENDIENTE';
