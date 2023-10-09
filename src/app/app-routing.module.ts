import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { QuicklinkStrategy } from 'ngx-quicklink';

const routes: Routes = [
  { path: '', loadChildren: () => import('./views/main/main.module').then(m => m.MainModule) },
  { path: 'checkout', loadChildren: () => import('./views/checkout/checkout.module').then(m => m.CheckoutModule) },
  { path: 'others', loadChildren: () => import('./views/others/others.module').then(m => m.OthersModule) },
  
  { path: '**', redirectTo: '/404' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { initialNavigation: 'enabledBlocking', scrollPositionRestoration: 'top', preloadingStrategy: QuicklinkStrategy })],
  exports: [RouterModule]
})

export class AppRoutingModule { }