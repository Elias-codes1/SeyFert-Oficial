import { ItemPedido } from '../models/pedido.model';

export type EstadoPedido = 'PENDIENTE' | 'CONFIRMADO' | 'ENTREGADO' | 'CANCELADO';
export type ItemNormalizado = { productoId: number; cantidad: number };

const TRANSICIONES: Record<EstadoPedido, readonly EstadoPedido[]> = {
  PENDIENTE: ['CONFIRMADO', 'CANCELADO'],
  CONFIRMADO: ['ENTREGADO', 'CANCELADO'],
  ENTREGADO: [],
  CANCELADO: [],
};

export function puedeTransicionar(anterior: string, siguiente: string): boolean {
  return (TRANSICIONES[anterior as EstadoPedido] ?? []).includes(siguiente as EstadoPedido);
}

export function normalizarItems(items: ItemPedido[]): ItemNormalizado[] {
  if (!Array.isArray(items) || items.length === 0) throw new Error('El pedido debe incluir al menos un producto');
  const cantidades = new Map<number, number>();
  for (const item of items) {
    if (!item || typeof item !== 'object' || !Number.isSafeInteger(item.productoId) || item.productoId <= 0 ||
        !Number.isSafeInteger(item.cantidad) || item.cantidad <= 0) {
      throw new Error('Los productos y cantidades del pedido no son válidos');
    }
    const total = (cantidades.get(item.productoId) ?? 0) + item.cantidad;
    if (!Number.isSafeInteger(total)) throw new Error('La cantidad solicitada es demasiado grande');
    cantidades.set(item.productoId, total);
  }
  return [...cantidades.entries()]
    .sort(([idA], [idB]) => idA - idB)
    .map(([productoId, cantidad]) => ({ productoId, cantidad }));
}
