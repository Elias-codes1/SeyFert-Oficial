import { pool } from '../config/db';
import { ElementoCatalogo, TipoCatalogo } from '../models/catalogo.model';

const TABLAS: Record<TipoCatalogo, string> = {
  categoria: 'categoria',
  marca: 'marca',
};

export async function listar(tipo: TipoCatalogo, soloActivas: boolean): Promise<ElementoCatalogo[]> {
  const tabla = TABLAS[tipo];
  const filtro = soloActivas ? 'WHERE activa = TRUE' : '';
  const r = await pool.query(`SELECT id, nombre, activa FROM ${tabla} ${filtro} ORDER BY nombre`);
  return r.rows;
}

export async function crear(tipo: TipoCatalogo, nombre: string): Promise<ElementoCatalogo> {
  const tabla = TABLAS[tipo];
  const r = await pool.query(
    `INSERT INTO ${tabla} (nombre) VALUES ($1) RETURNING id, nombre, activa`,
    [nombre],
  );
  return r.rows[0];
}

export async function actualizar(tipo: TipoCatalogo, id: number, nombre: string): Promise<ElementoCatalogo | undefined> {
  const tabla = TABLAS[tipo];
  const r = await pool.query(
    `UPDATE ${tabla} SET nombre = $2 WHERE id = $1 AND activa = TRUE
     RETURNING id, nombre, activa`,
    [id, nombre],
  );
  return r.rows[0];
}

export async function desactivar(tipo: TipoCatalogo, id: number): Promise<boolean> {
  const tabla = TABLAS[tipo];
  const r = await pool.query(`UPDATE ${tabla} SET activa = FALSE WHERE id = $1 AND activa = TRUE`, [id]);
  return r.rowCount === 1;
}
