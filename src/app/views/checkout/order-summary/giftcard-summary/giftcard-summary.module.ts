import { NgModule } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';

import { GiftcardSummaryRoutingModule } from './giftcard-summary-routing.module';
import { GiftcardSummaryComponent } from './giftcard-summary.component';

@NgModule({
  declarations: [
    GiftcardSummaryComponent
  ],
  imports: [
    SharedModule,
    GiftcardSummaryRoutingModule
  ]
})

export class GiftcardSummaryModule { }