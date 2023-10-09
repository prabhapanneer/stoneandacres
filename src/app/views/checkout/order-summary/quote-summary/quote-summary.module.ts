import { NgModule } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';

import { QuoteSummaryRoutingModule } from './quote-summary-routing.module';
import { QuoteSummaryComponent } from './quote-summary.component';

@NgModule({
  declarations: [
    QuoteSummaryComponent
  ],
  imports: [
    SharedModule,
    QuoteSummaryRoutingModule
  ]
})

export class QuoteSummaryModule { }