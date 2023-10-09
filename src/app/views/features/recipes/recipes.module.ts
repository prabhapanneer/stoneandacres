import { NgModule } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from '../../../shared/shared.module';

import { RecipesRoutingModule } from './recipes-routing.module';
import { RecipesComponent } from './recipes.component';

@NgModule({
  declarations: [
    RecipesComponent
  ],
  imports: [
    NgxPaginationModule,
    SharedModule,
    RecipesRoutingModule
  ]
})

export class RecipesModule { }