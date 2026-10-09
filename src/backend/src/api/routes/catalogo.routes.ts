import { Router } from 'express';
import { TipoCatalogo } from '../models/catalogo.model';
import { exigirRol, verificarToken } from '../middleware/auth.middleware';
import { crearControladorCatalogo } from '../controllers/catalogo.controller';

export function crearRouterCatalogo(tipo: TipoCatalogo): Router {
  const router = Router();
  const controller = crearControladorCatalogo(tipo);
  router.get('/', controller.listar);
  router.get('/admin', verificarToken, exigirRol('ADMIN'), controller.listarAdmin);
  router.post('/', verificarToken, exigirRol('ADMIN'), controller.crear);
  router.put('/:id', verificarToken, exigirRol('ADMIN'), controller.actualizar);
  router.delete('/:id', verificarToken, exigirRol('ADMIN'), controller.desactivar);
  return router;
}
