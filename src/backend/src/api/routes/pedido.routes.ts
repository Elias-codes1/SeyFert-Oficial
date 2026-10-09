import { Router } from 'express';
import * as pedidoController from '../controllers/pedido.controller';
import { exigirRol, verificarToken } from '../middleware/auth.middleware';

export const pedidoRouter = Router();

pedidoRouter.post('/', pedidoController.crear);
pedidoRouter.get('/', verificarToken, exigirRol('ADMIN'), pedidoController.listar);
pedidoRouter.patch('/:id', verificarToken, exigirRol('ADMIN'), pedidoController.actualizarEstado);
