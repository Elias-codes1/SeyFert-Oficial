import { Request, Response } from 'express';
import { TipoCatalogo } from '../models/catalogo.model';
import * as catalogoService from '../services/catalogo.service';

export function crearControladorCatalogo(tipo: TipoCatalogo) {
  return {
    listar: async (_req: Request, res: Response) => {
      try { res.json(await catalogoService.listar(tipo)); }
      catch { res.status(500).json({ mensaje: 'No se pudo cargar el catálogo' }); }
    },
    listarAdmin: async (_req: Request, res: Response) => {
      try { res.json(await catalogoService.listar(tipo, false)); }
      catch { res.status(500).json({ mensaje: 'No se pudo cargar el catálogo' }); }
    },
    crear: async (req: Request, res: Response) => {
      try { res.status(201).json(await catalogoService.crear(tipo, req.body?.nombre)); }
      catch (error) {
        const e = error as { code?: string; message?: string };
        res.status(e.code === '23505' ? 409 : 400).json({
          mensaje: e.code === '23505' ? 'Ya existe un elemento con ese nombre' : e.message,
        });
      }
    },
    actualizar: async (req: Request, res: Response) => {
      try {
        const actualizado = await catalogoService.actualizar(tipo, Number(req.params['id']), req.body?.nombre);
        res.json(actualizado);
      } catch (error) {
        const e = error as { code?: string; message?: string };
        res.status(e.code === '23505' ? 409 : 400).json({
          mensaje: e.code === '23505' ? 'Ya existe un elemento con ese nombre' : e.message,
        });
      }
    },
    desactivar: async (req: Request, res: Response) => {
      try {
        await catalogoService.desactivar(tipo, Number(req.params['id']));
        res.json({ mensaje: 'Elemento desactivado' });
      } catch (error) { res.status(400).json({ mensaje: (error as Error).message }); }
    },
  };
}
