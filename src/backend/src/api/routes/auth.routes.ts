import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { verificarToken } from '../middleware/auth.middleware';

export const authRouter = Router();

authRouter.post('/login', authController.login);
authRouter.post('/registro', authController.registrar);
authRouter.get('/perfil', verificarToken, authController.perfil);
authRouter.put('/perfil', verificarToken, authController.actualizarPerfil);
