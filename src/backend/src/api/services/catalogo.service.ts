import { ElementoCatalogo, TipoCatalogo } from '../models/catalogo.model';
import * as catalogoRepo from '../repositories/catalogo.repository';

export function listar(tipo: TipoCatalogo, soloActivas = true): Promise<ElementoCatalogo[]> {
  return catalogoRepo.listar(tipo, soloActivas);
}

export async function crear(tipo: TipoCatalogo, nombre: unknown): Promise<ElementoCatalogo> {
  const nombreNormalizado = validarNombre(nombre);
  return catalogoRepo.crear(tipo, nombreNormalizado);
}

export async function actualizar(tipo: TipoCatalogo, id: number, nombre: unknown): Promise<ElementoCatalogo> {
  validarId(id);
  const actualizado = await catalogoRepo.actualizar(tipo, id, validarNombre(nombre));
  if (!actualizado) throw new Error('Elemento no encontrado o inactivo');
  return actualizado;
}

export async function desactivar(tipo: TipoCatalogo, id: number): Promise<void> {
  validarId(id);
  if (!(await catalogoRepo.desactivar(tipo, id))) throw new Error('Elemento no encontrado o ya inactivo');
}

function validarNombre(nombre: unknown): string {
  if (typeof nombre !== 'string' || nombre.trim().length < 2 || nombre.trim().length > 80) {
    throw new Error('El nombre debe tener entre 2 y 80 caracteres');
  }
  return nombre.trim();
}

function validarId(id: number): void {
  if (!Number.isInteger(id) || id <= 0) throw new Error('El identificador no es válido');
}
