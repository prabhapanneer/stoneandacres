import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { FooterModule } from '../../shared/modules/footer/footer.module';

import { CheckoutRoutingModule } from './checkout-routing.module';
import { CheckoutComponent } from './checkout.component';

@NgModule({
  declarations: [CheckoutComponent],
  imports: [
    SharedModule,
    FooterModule,
    CheckoutRoutingModule
  ]
})

export class CheckoutModule { }