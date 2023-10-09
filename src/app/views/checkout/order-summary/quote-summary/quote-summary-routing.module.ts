import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuoteSummaryComponent } from './quote-summary.component';

const routes: Routes = [{ path: "", component: QuoteSummaryComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class QuoteSummaryRoutingModule { }