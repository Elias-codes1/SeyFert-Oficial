import { PoolClient } from 'pg';
import { pool } from '../config/db';

export async function obtenerClienteTransaccion(): Promise<PoolClient> {
  return pool.connect();
}

export async function buscarProductoActivo(client: PoolClient, id: number) {
  const r = await client.query(
    'SELECT id, precio, stock FROM producto WHERE id = $1 AND activo = TRUE FOR UPDATE',
    [id],
  );
  return r.rows[0] as { id: number; precio: string; stock: number } | undefined;
}

export async function descontarStock(client: PoolClient, productoId: number, cantidad: number): Promise<void> {
  const r = await client.query(
    'UPDATE producto SET stock = stock - $1 WHERE id = $2 AND stock >= $1',
    [cantidad, productoId],
  );
  if (r.rowCount !== 1) throw new Error(`Stock insuficiente para el producto ${productoId}`);
}

export async function devolverStock(client: PoolClient, productoId: number, cantidad: number): Promise<void> {
  await client.query('UPDATE producto SET stock = stock + $1 WHERE id = $2', [cantidad, productoId]);
}

export async function insertarPedido(
  client: PoolClient,
  nombreCliente: string,
  telefono: string,
  direccion: string,
  notas: string | null,
  total: number,
  horasVencimiento: number,
): Promise<number> {
  const r = await client.query(
    `INSERT INTO pedido (nombre_cliente, telefono, direccion, notas, total, estado, vence_en)
     VALUES ($1, $2, $3, $4, $5, 'PENDIENTE', NOW() + ($6 || ' hours')::INTERVAL)
     RETURNING id`,
    [nombreCliente, telefono, direccion, notas, total, horasVencimiento],
  );
  return r.rows[0].id;
}

export async function insertarDetalle(
  client: PoolClient,
  pedidoId: number,
  productoId: number,
  cantidad: number,
  precioUnitario: number,
): Promise<void> {
  await client.query(
    `INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario)
     VALUES ($1, $2, $3, $4)`,
    [pedidoId, productoId, cantidad, precioUnitario],
  );
}

export async function insertarHistorialInicial(client: PoolClient, pedidoId: number): Promise<void> {
  await client.query(
    `INSERT INTO historial_estado_pedido (pedido_id, estado_anterior, estado_nuevo)
     VALUES ($1, NULL, 'PENDIENTE')`,
    [pedidoId],
  );
}

// ===== Funciones para liberar reservas vencidas =====

export async function buscarVencidos(client: PoolClient) {
  const r = await client.query(
    `SELECT id FROM pedido WHERE estado = 'PENDIENTE' AND vence_en < NOW() FOR UPDATE SKIP LOCKED`,
  );
  return r.rows as { id: number }[];
}

export async function obtenerDetallesPedido(client: PoolClient, pedidoId: number) {
  const r = await client.query(
    'SELECT producto_id, cantidad FROM detalle_pedido WHERE pedido_id = $1',
    [pedidoId],
  );
  return r.rows as { producto_id: number; cantidad: number }[];
}

export async function cancelarPorVencimiento(client: PoolClient, pedidoId: number): Promise<void> {
  await client.query(`UPDATE pedido SET estado = 'CANCELADO' WHERE id = $1`, [pedidoId]);
  await client.query(
    `INSERT INTO historial_estado_pedido (pedido_id, estado_anterior, estado_nuevo, nota)
     VALUES ($1, 'PENDIENTE', 'CANCELADO', 'Vencido automáticamente')`,
    [pedidoId],
  );
}

// ===== Funciones requeridas para el panel de administración =====

export async function obtenerTodosLosPedidos() {
  const r = await pool.query(
    `SELECT p.id, p.nombre_cliente AS "nombreCliente", p.telefono, p.direccion,
            p.notas, p.total, p.estado, p.fecha AS "fechaCreacion",
            COALESCE(json_agg(json_build_object(
              'nombre', pr.nombre, 'cantidad', d.cantidad,
              'precioUnitario', d.precio_unitario
            )) FILTER (WHERE d.id IS NOT NULL), '[]'::json) AS items
     FROM pedido p
     LEFT JOIN detalle_pedido d ON d.pedido_id = p.id
     LEFT JOIN producto pr ON pr.id = d.producto_id
     GROUP BY p.id
     ORDER BY p.fecha DESC`
  );
  return r.rows;
}

export async function buscarEstadoPedido(client: PoolClient, id: number): Promise<string | undefined> {
  const r = await client.query('SELECT estado FROM pedido WHERE id = $1 FOR UPDATE', [id]);
  return r.rows[0]?.estado;
}

export async function cambiarEstadoPedido(client: PoolClient, id: number, estado: string): Promise<void> {
  await client.query('UPDATE pedido SET estado = $1 WHERE id = $2', [estado, id]);
}

export async function insertarHistorialEstado(
  client: PoolClient,
  pedidoId: number,
  estadoAnterior: string,
  estadoNuevo: string,
  usuarioId: number,
): Promise<void> {
  await client.query(
    `INSERT INTO historial_estado_pedido (pedido_id, estado_anterior, estado_nuevo, usuario_id)
     VALUES ($1, $2, $3, $4)`,
    [pedidoId, estadoAnterior, estadoNuevo, usuarioId],
  );
}
