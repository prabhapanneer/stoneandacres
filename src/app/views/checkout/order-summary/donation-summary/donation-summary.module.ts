import { NgModule } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';

import { DonationSummaryRoutingModule } from './donation-summary-routing.module';
import { DonationSummaryComponent } from './donation-summary.component';

@NgModule({
  declarations: [
    DonationSummaryComponent
  ],
  imports: [
    SharedModule,
    DonationSummaryRoutingModule
  ]
})

export class DonationSummaryModule { }