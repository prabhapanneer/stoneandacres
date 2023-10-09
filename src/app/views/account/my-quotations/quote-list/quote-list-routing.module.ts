import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuoteListComponent } from './quote-list.component';

const routes: Routes = [
  { path: ":type", component: QuoteListComponent },
  { path: ':type/:quot_id', loadChildren: () => import('./quote-details/quote-details.module').then(m => m.QuoteDetailsModule) },
  { path: ':type/:quot_id/:vendor_id', loadChildren: () => import('./quote-details/quote-details.module').then(m => m.QuoteDetailsModule) }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class QuoteListRoutingModule { }