import { NgModule } from '@angular/core';
import { SharedModule } from '../../../../../shared/shared.module';

import { QuoteDetailsRoutingModule } from './quote-details-routing.module';
import { QuoteDetailsComponent } from './quote-details.component';

@NgModule({
  declarations: [
    QuoteDetailsComponent
  ],
  imports: [
    SharedModule,
    QuoteDetailsRoutingModule
  ]
})

export class QuoteDetailsModule { }