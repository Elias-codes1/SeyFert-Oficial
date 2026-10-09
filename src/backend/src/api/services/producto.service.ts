import * as productoRepo from '../repositories/producto.repository';
import { pool } from '../config/db'; // NUEVO
import * as pedidoRepo from '../repositories/pedido.repository'; // NUEVO
import { FiltrosProducto } from '../models/producto.model';

export interface DatosProducto {
  nombre: string;
  descripcion: string | null;
  precio: number;
  stock: number;
  genero: string;
  categoriaId: number;
  marcaId: number;
}

const GENEROS = ['DAMA', 'CABALLERO', 'UNISEX'];

function validar(d: DatosProducto): string | null {
  if (!d.nombre || !d.nombre.trim() || d.nombre.trim().length > 150) return 'El nombre debe tener entre 1 y 150 caracteres';
  if (!Number.isFinite(d.precio) || d.precio <= 0) return 'El precio debe ser mayor que cero';
  if (!Number.isInteger(d.stock) || d.stock < 0) return 'El stock no es válido';
  if (d.descripcion !== null && d.descripcion.length > 1000) return 'La descripción no puede superar 1000 caracteres';
  if (!GENEROS.includes(d.genero)) return 'El género no es válido';
  if (!Number.isInteger(d.categoriaId) || d.categoriaId <= 0 || !Number.isInteger(d.marcaId) || d.marcaId <= 0) {
    return 'Categoría o marca no válida';
  }
  return null;
}

async function validarCatalogos(datos: DatosProducto): Promise<void> {
  if (!(await productoRepo.catalogosActivos(datos.categoriaId, datos.marcaId))) {
    throw new Error('Selecciona una categoría y una marca activas');
  }
}

// NUEVO: revisa los pedidos RESERVADO vencidos, los cancela y devuelve su stock
export async function liberarReservasVencidas() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const vencidos = await pedidoRepo.buscarVencidos(client);
    for (const pedido of vencidos) {
      const detalles = await pedidoRepo.obtenerDetallesPedido(client, pedido.id);
      for (const d of detalles) {
        await pedidoRepo.devolverStock(client, d.producto_id, d.cantidad);
      }
      await pedidoRepo.cancelarPorVencimiento(client, pedido.id);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error liberando reservas vencidas:', error);
  } finally {
    client.release();
  }
}

export async function listarCatalogo(filtros: FiltrosProducto) {
  await liberarReservasVencidas(); // NUEVO: limpia vencidos antes de mostrar el catálogo
  return productoRepo.listarActivos(filtros);
}

export async function listarParaAdmin() {
  return productoRepo.listarTodos();
}

export async function crearProducto(datos: DatosProducto) {
  const error = validar(datos);
  if (error) throw new Error(error);
  await validarCatalogos(datos);
  const id = await productoRepo.crear({ ...datos, nombre: datos.nombre.trim() });
  return { id };
}

export async function actualizarProducto(id: number, datos: DatosProducto) {
  if (!Number.isInteger(id) || id <= 0) throw new Error('El identificador del producto no es válido');
  const error = validar(datos);
  if (error) throw new Error(error);
  await validarCatalogos(datos);
  const ok = await productoRepo.actualizar(id, { ...datos, nombre: datos.nombre.trim() });
  if (!ok) throw new Error('Producto no encontrado');
}

export async function desactivarProducto(id: number) {
  if (!Number.isInteger(id) || id <= 0) throw new Error('El identificador del producto no es válido');
  const ok = await productoRepo.desactivar(id);
  if (!ok) throw new Error('Producto no encontrado');
}

export async function activarProducto(id: number) {
  if (!Number.isInteger(id) || id <= 0) throw new Error('El identificador del producto no es válido');
  const ok = await productoRepo.activar(id);
  if (!ok) throw new Error('Producto no encontrado o ya activo');
}
