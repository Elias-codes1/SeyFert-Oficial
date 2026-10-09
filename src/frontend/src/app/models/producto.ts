export type Genero = 'DAMA' | 'CABALLERO' | 'UNISEX';

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  stock: number;
  genero: Genero;
  activo: boolean;
  categoria: string;
  marca: string;
  categoriaId: number;
  marcaId: number;
}

export interface FiltrosProducto {
  q?: string;
  categoriaId?: number;
  marcaId?: number;
  genero?: Genero;
  precioMin?: number;
  precioMax?: number;
  page: number;
  pageSize: number;
}

export interface PaginaProductos {
  items: Producto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
