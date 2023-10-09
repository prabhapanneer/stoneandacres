import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyQuotationsComponent } from './my-quotations.component';

const routes: Routes = [
  { path: "", component: MyQuotationsComponent },
  { path: 'list', loadChildren: () => import('./quote-list/quote-list.module').then(m => m.QuoteListModule) }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class MyQuotationsRoutingModule { }