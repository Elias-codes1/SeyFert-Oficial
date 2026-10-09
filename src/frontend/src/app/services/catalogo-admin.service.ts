import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config';
import { CatalogoItem, TipoCatalogo } from '../models/catalogo';

@Injectable({ providedIn: 'root' })
export class CatalogoAdminService {
  private readonly http = inject(HttpClient);

  listar(tipo: TipoCatalogo): Observable<CatalogoItem[]> {
    return this.http.get<CatalogoItem[]>(`${API_BASE_URL}/${tipo}/admin`);
  }

  listarPublico(tipo: TipoCatalogo): Observable<CatalogoItem[]> {
    return this.http.get<CatalogoItem[]>(`${API_BASE_URL}/${tipo}`);
  }

  crear(tipo: TipoCatalogo, nombre: string): Observable<CatalogoItem> {
    return this.http.post<CatalogoItem>(`${API_BASE_URL}/${tipo}`, { nombre });
  }

  actualizar(tipo: TipoCatalogo, id: number, nombre: string): Observable<CatalogoItem> {
    return this.http.put<CatalogoItem>(`${API_BASE_URL}/${tipo}/${id}`, { nombre });
  }

  desactivar(tipo: TipoCatalogo, id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${API_BASE_URL}/${tipo}/${id}`);
  }
}
