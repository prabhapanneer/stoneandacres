import { NgModule } from '@angular/core';
import { QRCodeModule } from 'angularx-qrcode';

import { ProductOrderDetailsRoutingModule } from './product-order-details-routing.module';
import { SharedModule } from '../../../../shared/shared.module';
import { CustomizationModule } from '../../../../shared/modules/customization/customization.module';

import { ProductOrderDetailsComponent } from './product-order-details.component';
import { UppercaseDirective } from './directives/uppercase.directive';

@NgModule({
  declarations: [
    ProductOrderDetailsComponent,
    UppercaseDirective
  ],
  imports: [
    SharedModule,
    CustomizationModule,
    QRCodeModule,
    ProductOrderDetailsRoutingModule
  ]
})

export class ProductOrderDetailsModule { }