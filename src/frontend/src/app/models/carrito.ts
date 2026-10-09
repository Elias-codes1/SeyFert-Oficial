import { Producto } from './producto';

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

export interface PedidoDatos {
  nombreCliente: string;
  telefono: string;
  direccion: string;
  notas?: string;
  items: { productoId: number; cantidad: number }[];
}

export interface PedidoCreado {
  id: number;
  total: number;
}
