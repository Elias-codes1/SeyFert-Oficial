import * as pedidoRepo from '../repositories/pedido.repository';
import { PedidoInput } from '../models/pedido.model';
import { normalizarItems, puedeTransicionar } from '../domain/pedido-reglas';

const HORAS_VENCIMIENTO = 36;

export async function crearPedido(datos: PedidoInput) {
  const items = normalizarItems(datos.items);
  const client = await pedidoRepo.obtenerClienteTransaccion();

  try {
    await client.query('BEGIN');

    let total = 0;
    const lineas: { productoId: number; cantidad: number; precio: number }[] = [];

    for (const item of items) {
      const producto = await pedidoRepo.buscarProductoActivo(client, item.productoId);
      if (!producto) throw new Error('Producto no existe: ' + item.productoId);
      if (item.cantidad < 1 || item.cantidad > producto.stock) {
        throw new Error('Stock insuficiente para el producto ' + item.productoId);
      }
      const precio = Number(producto.precio);
      total += precio * item.cantidad;
      lineas.push({ productoId: item.productoId, cantidad: item.cantidad, precio });
    }

    const pedidoId = await pedidoRepo.insertarPedido(
      client,
      datos.nombreCliente,
      datos.telefono,
      datos.direccion,
      datos.notas ?? null,
      total,
      HORAS_VENCIMIENTO,
    );

    for (const l of lineas) {
      await pedidoRepo.insertarDetalle(client, pedidoId, l.productoId, l.cantidad, l.precio);
      await pedidoRepo.descontarStock(client, l.productoId, l.cantidad);
    }

    await pedidoRepo.insertarHistorialInicial(client, pedidoId);

    await client.query('COMMIT');
    return { id: pedidoId, total };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function listarPedidos() {
  return await pedidoRepo.obtenerTodosLosPedidos();
}

export async function actualizarEstadoPedido(id: number, estado: string, usuarioId: number) {
  const estados = ['PENDIENTE', 'CONFIRMADO', 'ENTREGADO', 'CANCELADO'];
  if (!Number.isInteger(id) || id <= 0 || !estados.includes(estado)) {
    throw new Error('El pedido o el estado no son válidos');
  }

  const client = await pedidoRepo.obtenerClienteTransaccion();
  try {
    await client.query('BEGIN');
    const anterior = await pedidoRepo.buscarEstadoPedido(client, id);
    if (!anterior) throw new Error('Pedido no encontrado');
    if (!puedeTransicionar(anterior, estado)) {
      throw new Error(`No se puede cambiar un pedido de ${anterior} a ${estado}`);
    }

    if (estado === 'CANCELADO') {
      const detalles = await pedidoRepo.obtenerDetallesPedido(client, id);
      for (const detalle of detalles) {
        await pedidoRepo.devolverStock(client, detalle.producto_id, detalle.cantidad);
      }
    }
    await pedidoRepo.cambiarEstadoPedido(client, id, estado);
    await pedidoRepo.insertarHistorialEstado(client, id, anterior, estado, usuarioId);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
