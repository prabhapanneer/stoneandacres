import { NgModule } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from '../../../shared/shared.module';

import { CatalogPageRoutingModule } from './catalog-page-routing.module';
import { CatalogPageComponent } from './catalog-page.component';

@NgModule({
  declarations: [
    CatalogPageComponent
  ],
  imports: [
    NgxPaginationModule,
    SharedModule,
    CatalogPageRoutingModule
  ]
})

export class CatalogPageModule { }