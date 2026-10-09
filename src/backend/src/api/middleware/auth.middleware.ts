import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

type UsuarioToken = { id: number; rol: 'ADMIN' | 'CLIENTE' };

declare global {
  namespace Express {
    interface Request { usuario?: UsuarioToken }
  }
}

export function verificarToken(req: Request, res: Response, next: NextFunction) {
  const encabezado = req.headers['authorization'];

  if (!encabezado || !encabezado.startsWith('Bearer ')) {
    res.status(401).json({ mensaje: 'Falta el token de acceso' });
    return;
  }

  const token = encabezado.slice(7);

  try {
    const datos = jwt.verify(token, process.env['JWT_SECRETO'] as string) as Partial<UsuarioToken>;
    const id = Number(datos.id);
    if (!Number.isSafeInteger(id) || id <= 0 || !['ADMIN', 'CLIENTE'].includes(datos.rol ?? '')) {
      res.status(401).json({ mensaje: 'Token inválido' });
      return;
    }
    req.usuario = { id, rol: datos.rol as UsuarioToken['rol'] };
    next();
  } catch {
    res.status(401).json({ mensaje: 'Token inválido o vencido' });
  }
}

export function exigirRol(...roles: UsuarioToken['rol'][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      res.status(403).json({ mensaje: 'No tienes permiso para realizar esta acción' });
      return;
    }
    next();
  };
}
