import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../config';

export interface LoginRespuesta {
  token: string;
  rol: 'ADMIN' | 'CLIENTE';
}

export interface PerfilUsuario { id: number; nombre: string; email: string; rol: 'ADMIN' | 'CLIENTE'; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly esNavegador = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly CLAVE_TOKEN = 'seyfert_session_token';

  readonly token = signal<string | null>(this.obtenerTokenInicial());
  readonly rol = signal<'ADMIN' | 'CLIENTE' | null>(this.leerRol(this.token()));

  login(credenciales: { usuario: string; clave: string }): Observable<LoginRespuesta> {
    return this.http
      .post<LoginRespuesta>(`${API_BASE_URL}/auth/login`, {
        email: credenciales.usuario,
        clave: credenciales.clave,
      })
      .pipe(
        tap((res) => {
          if (res?.token) {
            this.guardarToken(res.token);
          }
        })
      );
  }

  registrar(datos: { nombre: string; email: string; clave: string }): Observable<{ token: string; usuario: PerfilUsuario }> {
    return this.http.post<{ token: string; usuario: PerfilUsuario }>(`${API_BASE_URL}/auth/registro`, datos).pipe(
      tap((res) => { if (res?.token) this.guardarToken(res.token); }),
    );
  }

  obtenerPerfil(): Observable<PerfilUsuario> {
    return this.http.get<PerfilUsuario>(`${API_BASE_URL}/auth/perfil`);
  }

  actualizarPerfil(datos: { nombre: string; email: string }): Observable<PerfilUsuario> {
    return this.http.put<PerfilUsuario>(`${API_BASE_URL}/auth/perfil`, datos);
  }

  logout(): void {
    if (this.esNavegador) {
      localStorage.removeItem(this.CLAVE_TOKEN);
    }
    this.token.set(null);
    this.rol.set(null);
  }

  estaAutenticado(): boolean {
    return !!this.token() && this.rol() !== null;
  }

  private guardarToken(token: string): void {
    if (this.esNavegador) {
      localStorage.setItem(this.CLAVE_TOKEN, token);
    }
    this.token.set(token);
    this.rol.set(this.leerRol(token));
  }

  private leerRol(token: string | null): 'ADMIN' | 'CLIENTE' | null {
    try {
      if (!token) return null;
      const payload = token.split('.')[1];
      if (!payload) return null;
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const datos = JSON.parse(globalThis.atob(base64)) as { rol?: unknown };
      return datos.rol === 'ADMIN' || datos.rol === 'CLIENTE' ? datos.rol : null;
    } catch {
      return null;
    }
  }

  private obtenerTokenInicial(): string | null {
    if (this.esNavegador) {
      return localStorage.getItem(this.CLAVE_TOKEN);
    }
    return null;
  }
}
