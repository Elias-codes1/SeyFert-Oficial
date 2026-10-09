import { Request, Response } from 'express';
import * as productoService from '../services/producto.service';
import { FiltrosProducto, Genero } from '../models/producto.model';

class ErrorEntrada extends Error {}

function leerDatos(body: Record<string, unknown>) {
  return {
    nombre: String(body['nombre'] ?? ''),
    descripcion: body['descripcion'] ? String(body['descripcion']) : null,
    precio: Number(body['precio']),
    stock: Number(body['stock']),
    genero: String(body['genero'] ?? ''),
    categoriaId: Number(body['categoriaId']),
    marcaId: Number(body['marcaId']),
  };
}

function leerNumeroQuery(valor: unknown, nombre: string): number | undefined {
  if (valor === undefined) return undefined;
  if (typeof valor !== 'string' || valor.trim() === '') throw new ErrorEntrada(`El filtro ${nombre} no es válido`);
  const numero = Number(valor);
  if (!Number.isFinite(numero)) throw new ErrorEntrada(`El filtro ${nombre} no es válido`);
  return numero;
}

export async function listar(req: Request, res: Response) {
  try {
    const page = leerNumeroQuery(req.query['page'], 'page') ?? 1;
    const pageSize = leerNumeroQuery(req.query['pageSize'], 'pageSize') ?? 12;
    const precioMin = leerNumeroQuery(req.query['precioMin'], 'precioMin');
    const precioMax = leerNumeroQuery(req.query['precioMax'], 'precioMax');
    const categoriaId = leerNumeroQuery(req.query['categoriaId'], 'categoriaId');
    const marcaId = leerNumeroQuery(req.query['marcaId'], 'marcaId');
    const qValue = req.query['q'];
    const generoValue = req.query['genero'];
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 50) {
      throw new ErrorEntrada('La página o el tamaño de página no son válidos');
    }
    if (categoriaId !== undefined && (!Number.isInteger(categoriaId) || categoriaId < 1)) throw new ErrorEntrada('La categoría no es válida');
    if (marcaId !== undefined && (!Number.isInteger(marcaId) || marcaId < 1)) throw new ErrorEntrada('La marca no es válida');
    if (precioMin !== undefined && precioMin < 0 || precioMax !== undefined && precioMax < 0 ||
        precioMin !== undefined && precioMax !== undefined && precioMin > precioMax) {
      throw new ErrorEntrada('El rango de precio no es válido');
    }
    if (qValue !== undefined && (typeof qValue !== 'string' || qValue.length > 100)) throw new ErrorEntrada('La búsqueda no es válida');
    const generos: Genero[] = ['DAMA', 'CABALLERO', 'UNISEX'];
    if (generoValue !== undefined && (typeof generoValue !== 'string' || !generos.includes(generoValue as Genero))) {
      throw new ErrorEntrada('El género no es válido');
    }
    const filtros: FiltrosProducto = {
      page, pageSize, ...(typeof qValue === 'string' && qValue.trim() ? { q: qValue.trim() } : {}),
      ...(categoriaId === undefined ? {} : { categoriaId }), ...(marcaId === undefined ? {} : { marcaId }),
      ...(precioMin === undefined ? {} : { precioMin }), ...(precioMax === undefined ? {} : { precioMax }),
      ...(typeof generoValue === 'string' ? { genero: generoValue as Genero } : {}),
    };
    res.json(await productoService.listarCatalogo(filtros));
  } catch (error) {
    if (!(error instanceof ErrorEntrada)) console.error('Error al listar el catálogo:', error);
    res.status(error instanceof ErrorEntrada ? 400 : 500)
      .json({ mensaje: (error as Error).message || 'Error al obtener los productos' });
  }
}

export async function listarAdmin(_req: Request, res: Response) {
  try {
    res.json(await productoService.listarParaAdmin());
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener los productos' });
  }
}

export async function crear(req: Request, res: Response) {
  try {
    const resultado = await productoService.crearProducto(leerDatos(req.body));
    res.status(201).json(resultado);
  } catch (error) {
    res.status(400).json({ mensaje: (error as Error).message });
  }
}

export async function actualizar(req: Request, res: Response) {
  try {
    await productoService.actualizarProducto(Number(req.params['id']), leerDatos(req.body));
    res.json({ mensaje: 'Producto actualizado' });
  } catch (error) {
    res.status(400).json({ mensaje: (error as Error).message });
  }
}

export async function desactivar(req: Request, res: Response) {
  try {
    await productoService.desactivarProducto(Number(req.params['id']));
    res.json({ mensaje: 'Producto desactivado' });
  } catch (error) {
    res.status(400).json({ mensaje: (error as Error).message });
  }
}

export async function activar(req: Request, res: Response) {
  try {
    await productoService.activarProducto(Number(req.params['id']));
    res.json({ mensaje: 'Producto activado' });
  } catch (error) {
    res.status(400).json({ mensaje: (error as Error).message });
  }
}
