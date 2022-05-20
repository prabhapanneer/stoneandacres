import { NgModule } from '@angular/core';
import { SharedModule } from '../../../../../shared/shared.module';

import { OrderDetailsRoutingModule } from './order-details-routing.module';
import { OrderDetailsComponent } from './order-details.component';

@NgModule({
  declarations: [OrderDetailsComponent],
  imports: [
    SharedModule,
    OrderDetailsRoutingModule
  ]
})

export class OrderDetailsModule { }