import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuoteStatusComponent } from './quote-status.component';

const routes: Routes = [{ path: "", component: QuoteStatusComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class QuoteStatusRoutingModule { }