import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as usuarioRepo from '../repositories/usuario.repository';

export async function iniciarSesion(email: string, clave: string) {
  const usuario = await usuarioRepo.buscarPorEmail(email);
  const valido = usuario && (await bcrypt.compare(clave, usuario.password));

  if (!usuario || !valido) return null;

  const token = jwt.sign(
    { id: usuario.id, rol: usuario.rol },
    process.env['JWT_SECRETO'] as string,
    { expiresIn: '8h' },
  );

  return { token, nombre: usuario.nombre, rol: usuario.rol };
}

export async function registrarCliente(nombre: string, email: string, clave: string) {
  const existente = await usuarioRepo.buscarPorEmail(email);
  if (existente) throw new Error('El correo ya está registrado');
  const password = await bcrypt.hash(clave, 10);
  const usuario = await usuarioRepo.crearCliente(nombre, email, password);
  const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, process.env['JWT_SECRETO'] as string, { expiresIn: '8h' });
  return { token, usuario };
}

export async function obtenerPerfil(id: number) {
  return usuarioRepo.buscarPerfil(id);
}

export async function guardarPerfil(id: number, nombre: string, email: string) {
  return usuarioRepo.actualizarPerfil(id, nombre, email);
}
