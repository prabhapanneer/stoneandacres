import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';

import { OrderReviewRoutingModule } from './order-review-routing.module';
import { OrderReviewComponent } from './order-review.component';

@NgModule({
  declarations: [OrderReviewComponent],
  imports: [
    SharedModule,
    OrderReviewRoutingModule
  ]
})

export class OrderReviewModule { }