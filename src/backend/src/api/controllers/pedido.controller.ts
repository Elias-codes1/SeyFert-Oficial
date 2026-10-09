import { Request, Response } from 'express';
import * as pedidoService from '../services/pedido.service';

export async function crear(req: Request, res: Response) {
  const { nombreCliente, telefono, direccion, notas, items } = req.body ?? {};

  if (typeof nombreCliente !== 'string' || nombreCliente.trim().length < 2 || nombreCliente.trim().length > 120 ||
      typeof telefono !== 'string' || telefono.replace(/\D/g, '').length < 8 || telefono.length > 20 ||
      typeof direccion !== 'string' || direccion.trim().length < 5 || direccion.trim().length > 255 ||
      (notas !== undefined && notas !== null && (typeof notas !== 'string' || notas.length > 500)) ||
      !Array.isArray(items) || items.length === 0 || items.length > 50) {
    res.status(400).json({ mensaje: 'Completa los datos del cliente y agrega hasta 50 productos válidos' });
    return;
  }

  try {
    const pedido = await pedidoService.crearPedido({
      nombreCliente: nombreCliente.trim(),
      telefono: telefono.trim(),
      direccion: direccion.trim(),
      notas: typeof notas === 'string' ? notas.trim() : undefined,
      items,
    });
    res.status(201).json(pedido);
  } catch (error) {
    console.error(error);
    res.status(400).json({ mensaje: (error as Error).message });
  }
}

export async function listar(_req: Request, res: Response) {
  try {
    const pedidos = await pedidoService.listarPedidos();
    res.json(pedidos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener los pedidos' });
  }
}

export async function actualizarEstado(req: Request, res: Response) {
  try {
    const id = Number(req.params['id']);
    const estado = req.body?.estado;
    if (typeof estado !== 'string' || !req.usuario) {
      res.status(400).json({ mensaje: 'El estado del pedido no es válido' });
      return;
    }
    await pedidoService.actualizarEstadoPedido(id, estado, req.usuario.id);
    res.json({ mensaje: 'Estado del pedido actualizado' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ mensaje: (error as Error).message });
  }
}
