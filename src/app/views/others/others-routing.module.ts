import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '404', loadChildren: () => import('./not-found/not-found.module').then(m => m.NotFoundModule) },
  { path: 'password-recovery/:token', loadChildren: () => import('./pwd-recovery/pwd-recovery.module').then(m => m.PwdRecoveryModule) },
  { path: 'service-unavailable', loadChildren: () => import('./service-unavailable/service-unavailable.module').then(m => m.ServiceUnavailableModule) }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class OthersRoutingModule { }