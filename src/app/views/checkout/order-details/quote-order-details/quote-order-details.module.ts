import { NgModule } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';

import { QuoteOrderDetailsRoutingModule } from './quote-order-details-routing.module';
import { QuoteOrderDetailsComponent } from './quote-order-details.component';

@NgModule({
  declarations: [
    QuoteOrderDetailsComponent
  ],
  imports: [
    SharedModule,
    QuoteOrderDetailsRoutingModule
  ]
})

export class QuoteOrderDetailsModule { }