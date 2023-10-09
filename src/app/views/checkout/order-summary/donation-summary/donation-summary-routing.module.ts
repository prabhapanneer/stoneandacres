import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DonationSummaryComponent } from './donation-summary.component';

const routes: Routes = [{ path: "", component: DonationSummaryComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class DonationSummaryRoutingModule { }