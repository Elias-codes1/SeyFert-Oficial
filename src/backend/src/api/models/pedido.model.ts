export interface ItemPedido {
  productoId: number;
  cantidad: number;
}

export interface PedidoInput {
  nombreCliente: string;
  telefono: string;
  direccion: string;
  notas?: string | null;
  items: ItemPedido[];
}