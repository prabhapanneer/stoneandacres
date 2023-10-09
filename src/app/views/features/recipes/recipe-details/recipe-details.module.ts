import { NgModule } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';

import { RecipeDetailsRoutingModule } from './recipe-details-routing.module';
import { RecipeDetailsComponent } from './recipe-details.component';

@NgModule({
  declarations: [
    RecipeDetailsComponent
  ],
  imports: [
    SharedModule,
    RecipeDetailsRoutingModule
  ]
})

export class RecipeDetailsModule { }