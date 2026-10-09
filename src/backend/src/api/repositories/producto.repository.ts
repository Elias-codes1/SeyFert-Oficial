import { pool } from '../config/db';
import { FiltrosProducto, PaginaProductos, Producto } from '../models/producto.model';

const SELECT_BASE = `
  SELECT p.id, p.nombre, p.descripcion, p.precio, p.stock, p.genero, p.activo,
        c.nombre AS categoria, m.nombre AS marca,
        p.categoria_id AS "categoriaId", p.marca_id AS "marcaId"
  FROM producto p
  JOIN categoria c ON c.id = p.categoria_id
  JOIN marca m ON m.id = p.marca_id
`;

export async function listarActivos(filtros: FiltrosProducto): Promise<PaginaProductos> {
  const condiciones = ['p.activo = TRUE', 'c.activa = TRUE', 'm.activa = TRUE'];
  const valores: (string | number)[] = [];
  const agregar = (columna: string, valor: string | number, operador = '=') => {
    valores.push(valor);
    condiciones.push(`${columna} ${operador} $${valores.length}`);
  };
  if (filtros.q) agregar('p.nombre', `%${filtros.q}%`, 'ILIKE');
  if (filtros.categoriaId !== undefined) agregar('p.categoria_id', filtros.categoriaId);
  if (filtros.marcaId !== undefined) agregar('p.marca_id', filtros.marcaId);
  if (filtros.genero) agregar('p.genero', filtros.genero);
  if (filtros.precioMin !== undefined) agregar('p.precio', filtros.precioMin, '>=');
  if (filtros.precioMax !== undefined) agregar('p.precio', filtros.precioMax, '<=');
  const where = condiciones.join(' AND ');
  const count = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM producto p
     JOIN categoria c ON c.id = p.categoria_id
     JOIN marca m ON m.id = p.marca_id
     WHERE ${where}`,
    valores,
  );
  const total = Number(count.rows[0].total);
  const paginaValores = [...valores, filtros.pageSize, (filtros.page - 1) * filtros.pageSize];
  const r = await pool.query(
    `${SELECT_BASE} WHERE ${where} ORDER BY p.nombre LIMIT $${valores.length + 1} OFFSET $${valores.length + 2}`,
    paginaValores,
  );
  return {
    items: r.rows,
    total,
    page: filtros.page,
    pageSize: filtros.pageSize,
    totalPages: Math.max(1, Math.ceil(total / filtros.pageSize)),
  };
}

export async function listarTodos(): Promise<Producto[]> {
  const r = await pool.query(`${SELECT_BASE} ORDER BY p.nombre`);
  return r.rows;
}

export async function buscarPorId(id: number): Promise<Producto | undefined> {
  const r = await pool.query(`${SELECT_BASE} WHERE p.id = $1`, [id]);
  return r.rows[0];
}

export async function crear(datos: {
  nombre: string;
  descripcion: string | null;
  precio: number;
  stock: number;
  genero: string;
  categoriaId: number;
  marcaId: number;
}): Promise<number> {
  const r = await pool.query(
    `INSERT INTO producto (nombre, descripcion, precio, stock, genero, categoria_id, marca_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [
      datos.nombre,
      datos.descripcion,
      datos.precio,
      datos.stock,
      datos.genero,
      datos.categoriaId,
      datos.marcaId,
    ],
  );
  return r.rows[0].id;
}

export async function actualizar(
  id: number,
  datos: {
    nombre: string;
    descripcion: string | null;
    precio: number;
    stock: number;
    genero: string;
    categoriaId: number;
    marcaId: number;
  },
): Promise<boolean> {
  const r = await pool.query(
    `UPDATE producto
     SET nombre = $1, descripcion = $2, precio = $3, stock = $4,
         genero = $5, categoria_id = $6, marca_id = $7
     WHERE id = $8`,
    [
      datos.nombre,
      datos.descripcion,
      datos.precio,
      datos.stock,
      datos.genero,
      datos.categoriaId,
      datos.marcaId,
      id,
    ],
  );
  return (r.rowCount ?? 0) > 0;
}

export async function desactivar(id: number): Promise<boolean> {
  const r = await pool.query('UPDATE producto SET activo = FALSE WHERE id = $1 AND activo = TRUE', [id]);
  return (r.rowCount ?? 0) > 0;
}

export async function catalogosActivos(categoriaId: number, marcaId: number): Promise<boolean> {
  const r = await pool.query(
    `SELECT EXISTS(SELECT 1 FROM categoria WHERE id = $1 AND activa = TRUE)
       AND EXISTS(SELECT 1 FROM marca WHERE id = $2 AND activa = TRUE) AS validos`,
    [categoriaId, marcaId],
  );
  return Boolean(r.rows[0]?.validos);
}

export async function activar(id: number): Promise<boolean> {
  const r = await pool.query('UPDATE producto SET activo = TRUE WHERE id = $1 AND activo = FALSE', [id]);
  return (r.rowCount ?? 0) > 0;
}
