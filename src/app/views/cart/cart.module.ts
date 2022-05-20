import { NgModule } from '@angular/core';

import { CartRoutingModule } from './cart-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { CartComponent } from './cart.component';

@NgModule({
  declarations: [CartComponent],
  imports: [
    SharedModule,
    CartRoutingModule
  ]
})

export class CartModule { }