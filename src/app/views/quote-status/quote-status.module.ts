import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';

import { QuoteStatusRoutingModule } from './quote-status-routing.module';
import { QuoteStatusComponent } from './quote-status.component';

@NgModule({
  declarations: [
    QuoteStatusComponent
  ],
  imports: [
    SharedModule,
    QuoteStatusRoutingModule
  ]
})

export class QuoteStatusModule { }