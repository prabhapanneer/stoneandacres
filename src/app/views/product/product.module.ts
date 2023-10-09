import { NgModule } from '@angular/core';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { NgxPaginationModule } from 'ngx-pagination';

import { ProductRoutingModule } from './product-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { CustomizationModule } from '../../shared/modules/customization/customization.module';
import { ProductComponent } from './product.component';
import { RelatedProductsDirective } from './directives/related-products.directive';
import { ThumbnailDirective } from './directives/thumbnail.directive';

@NgModule({
  declarations: [ProductComponent, RelatedProductsDirective, ThumbnailDirective],
  imports: [
    SharedModule,
    CustomizationModule,
    ProductRoutingModule,
    NgxPaginationModule,
    AccordionModule.forRoot()
  ]
})

export class ProductModule { }