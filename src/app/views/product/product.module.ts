import { NgModule } from '@angular/core';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { NgxPaginationModule } from 'ngx-pagination';

import { ProductRoutingModule } from './product-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { ProductComponent } from './product.component';

@NgModule({
  declarations: [ProductComponent],
  imports: [
    SharedModule,
    ProductRoutingModule,
    YouTubePlayerModule,
    NgxPaginationModule,
    AccordionModule.forRoot()
  ]
})

export class ProductModule { }