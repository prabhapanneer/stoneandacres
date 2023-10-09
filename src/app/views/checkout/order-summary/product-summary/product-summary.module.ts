import { NgModule } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { CustomizationModule } from '../../../../shared/modules/customization/customization.module';

import { ProductSummaryRoutingModule } from './product-summary-routing.module';
import { ProductSummaryComponent } from './product-summary.component';

@NgModule({
  declarations: [
    ProductSummaryComponent
  ],
  imports: [
    SharedModule,
    CustomizationModule,
    ProductSummaryRoutingModule
  ]
})

export class ProductSummaryModule { }