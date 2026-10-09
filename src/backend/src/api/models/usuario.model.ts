export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  password: string;
  rol: 'ADMIN' | 'CLIENTE';
}

export interface PerfilUsuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'CLIENTE';
}
