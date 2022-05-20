import { NgModule } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { CollapseModule } from 'ngx-bootstrap/collapse';

import { CategoryRoutingModule } from './category-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { CategoryComponent } from './category.component';

@NgModule({
  declarations: [CategoryComponent],
  imports: [
    SharedModule,
    CategoryRoutingModule,
    NgxPaginationModule,
    CollapseModule.forRoot()
  ]
})

export class CategoryModule { }