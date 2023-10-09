import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuoteOrderDetailsComponent } from './quote-order-details.component';

const routes: Routes = [{ path: "", component: QuoteOrderDetailsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class QuoteOrderDetailsRoutingModule { }