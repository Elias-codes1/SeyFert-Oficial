import { Router } from 'express';
import { indicadores } from '../controllers/dashboard.controller';
import { exigirRol, verificarToken } from '../middleware/auth.middleware';

export const dashboardRouter = Router();
dashboardRouter.get('/', verificarToken, exigirRol('ADMIN'), indicadores);
