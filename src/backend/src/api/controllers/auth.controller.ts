import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

export async function login(req: Request, res: Response) {
  const { email, clave } = req.body ?? {};

  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof clave !== 'string' || clave.length < 1 || clave.length > 72) {
    res.status(400).json({ mensaje: 'Ingresa un correo válido y una contraseña válida' });
    return;
  }

  try {
    const resultado = await authService.iniciarSesion(email, clave);

    if (!resultado) {
      res.status(401).json({ mensaje: 'Correo o clave incorrectos' });
      return;
    }

    res.json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al iniciar sesión' });
  }
}

export async function registrar(req: Request, res: Response) {
  const { nombre, email, clave } = req.body ?? {};
  if (typeof nombre !== 'string' || nombre.trim().length < 2 || nombre.trim().length > 100 ||
      typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof clave !== 'string' || clave.length < 8 || clave.length > 72) {
    res.status(400).json({ mensaje: 'Ingresa nombre, correo válido y una contraseña de 8 a 72 caracteres' });
    return;
  }
  try {
    res.status(201).json(await authService.registrarCliente(nombre, email, clave));
  } catch (error) {
    const e = error as { code?: string };
    if (e.code === '23505') {
      res.status(409).json({ mensaje: 'El correo ya está registrado' });
      return;
    }
    res.status(400).json({ mensaje: (error as Error).message });
  }
}

export async function perfil(req: Request, res: Response) {
  const usuario = await authService.obtenerPerfil(req.usuario!.id);
  if (!usuario) {
    res.status(404).json({ mensaje: 'Usuario no encontrado' });
    return;
  }
  res.json(usuario);
}

export async function actualizarPerfil(req: Request, res: Response) {
  const { nombre, email } = req.body ?? {};
  if (typeof nombre !== 'string' || nombre.trim().length < 2 || nombre.trim().length > 100 ||
      typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    res.status(400).json({ mensaje: 'Ingresa un nombre y correo válidos' });
    return;
  }
  try {
    const usuario = await authService.guardarPerfil(req.usuario!.id, nombre, email);
    if (!usuario) {
      res.status(404).json({ mensaje: 'Usuario no encontrado' });
      return;
    }
    res.json(usuario);
  } catch (error) {
    const e = error as { code?: string };
    if (e.code === '23505') {
      res.status(409).json({ mensaje: 'El correo ya está registrado' });
      return;
    }
    res.status(500).json({ mensaje: 'No se pudo actualizar el perfil' });
  }
}
