import { pool } from '../config/db';

export interface IndicadoresDashboard {
  productosActivos: number;
  productosBajoStock: number;
  pedidosPendientes: number;
  pedidosMes: number;
}

export async function obtenerIndicadores(): Promise<IndicadoresDashboard> {
  const resultado = await pool.query(
    `SELECT
       (SELECT COUNT(*)::int FROM producto WHERE activo = TRUE) AS "productosActivos",
       (SELECT COUNT(*)::int FROM producto WHERE activo = TRUE AND stock <= 5) AS "productosBajoStock",
       (SELECT COUNT(*)::int FROM pedido WHERE estado = 'PENDIENTE') AS "pedidosPendientes",
       (SELECT COUNT(*)::int FROM pedido WHERE fecha >= date_trunc('month', CURRENT_DATE)) AS "pedidosMes"`,
  );
  return resultado.rows[0] as IndicadoresDashboard;
}
