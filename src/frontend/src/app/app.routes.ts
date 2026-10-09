import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './guards/auth.guard';
import { Carrito } from './pages/carrito/carrito';
import { Catalogo } from './pages/catalogo/catalogo';
import { AdminLogin } from './pages/admin/login/login';
import { AdminPedidos } from './pages/admin/pedidos/pedidos';
import { AdminProductos } from './pages/admin/productos/productos';
import { Registro } from './pages/registro/registro';
import { Perfil } from './pages/perfil/perfil';
import { AdminCatalogos } from './pages/admin/catalogos/catalogos';
import { AdminDashboard } from './pages/admin/dashboard/dashboard';
import { NoEncontrado } from './pages/no-encontrado/no-encontrado';

export const routes: Routes = [
  { path: '', component: Catalogo, title: 'SeyFert | Catálogo' },
  { path: 'carrito', component: Carrito, title: 'SeyFert | Carrito' },
  { path: 'registro', component: Registro, title: 'SeyFert | Crear cuenta' },
  { path: 'perfil', component: Perfil, canActivate: [authGuard], title: 'SeyFert | Perfil' },
  { path: 'admin/login', component: AdminLogin, title: 'SeyFert Admin | Login' },
  { path: 'admin', pathMatch: 'full', redirectTo: 'admin/dashboard' },
  {
    path: 'admin/dashboard', component: AdminDashboard, canActivate: [authGuard, adminGuard],
    title: 'SeyFert Admin | Resumen',
  },
  {
    path: 'admin/catalogos',
    component: AdminCatalogos,
    canActivate: [authGuard, adminGuard],
    title: 'SeyFert Admin | Categorías y marcas',
  },
  {
    path: 'admin/pedidos',
    component: AdminPedidos,
    canActivate: [authGuard, adminGuard],
    title: 'SeyFert Admin | Pedidos',
  },
  {
    path: 'admin/productos',
    component: AdminProductos,
    canActivate: [authGuard, adminGuard],
    title: 'SeyFert Admin | Productos',
  },
  { path: '**', component: NoEncontrado, title: 'SeyFert | Página no encontrada' },
];
