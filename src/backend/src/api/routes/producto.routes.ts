import { Router } from 'express';
import * as productoController from '../controllers/producto.controller';
import { exigirRol, verificarToken } from '../middleware/auth.middleware';

export const productoRouter = Router();

// Público: el catálogo que ve el cliente
productoRouter.get('/', productoController.listar);

// Protegido: solo con token de administradora
productoRouter.get('/admin', verificarToken, exigirRol('ADMIN'), productoController.listarAdmin);
productoRouter.post('/', verificarToken, exigirRol('ADMIN'), productoController.crear);
productoRouter.put('/:id', verificarToken, exigirRol('ADMIN'), productoController.actualizar);
productoRouter.delete('/:id', verificarToken, exigirRol('ADMIN'), productoController.desactivar);
productoRouter.patch('/:id/activar', verificarToken, exigirRol('ADMIN'), productoController.activar);
