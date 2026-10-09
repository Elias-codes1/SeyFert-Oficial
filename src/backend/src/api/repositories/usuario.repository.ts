import { pool } from '../config/db';
import { PerfilUsuario, Usuario } from '../models/usuario.model';

export async function buscarPorEmail(email: string): Promise<Usuario | undefined> {
  const r = await pool.query(
    'SELECT id, nombre, email, password, rol FROM usuario WHERE LOWER(email) = LOWER($1) AND activo = TRUE',
    [email.trim()],
  );
  return r.rows[0];
}

export async function crearCliente(nombre: string, email: string, password: string): Promise<PerfilUsuario> {
  const r = await pool.query(
    `INSERT INTO usuario (nombre, email, password, rol)
     VALUES ($1, LOWER($2), $3, 'CLIENTE')
     RETURNING id, nombre, email, rol`,
    [nombre.trim(), email.trim(), password],
  );
  return r.rows[0];
}

export async function buscarPerfil(id: number): Promise<PerfilUsuario | undefined> {
  const r = await pool.query(
    'SELECT id, nombre, email, rol FROM usuario WHERE id = $1 AND activo = TRUE',
    [id],
  );
  return r.rows[0];
}

export async function actualizarPerfil(id: number, nombre: string, email: string): Promise<PerfilUsuario | undefined> {
  const r = await pool.query(
    `UPDATE usuario SET nombre = $2, email = LOWER($3)
     WHERE id = $1 AND activo = TRUE
     RETURNING id, nombre, email, rol`,
    [id, nombre.trim(), email.trim()],
  );
  return r.rows[0];
}
