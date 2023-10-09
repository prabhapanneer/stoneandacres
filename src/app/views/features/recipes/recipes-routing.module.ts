import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecipesComponent } from './recipes.component';

const routes: Routes = [
  { path: "", component: RecipesComponent },
  { path: ':id', loadChildren: () => import('./recipe-details/recipe-details.module').then(m => m.RecipeDetailsModule) }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class RecipesRoutingModule { }