import { Request, Response } from 'express';
import { obtenerIndicadores } from '../repositories/dashboard.repository';

export async function indicadores(_req: Request, res: Response): Promise<void> {
  try {
    res.json(await obtenerIndicadores());
  } catch (error) {
    console.error('Error al consultar indicadores:', error);
    res.status(500).json({ mensaje: 'No se pudieron cargar los indicadores.' });
  }
}
