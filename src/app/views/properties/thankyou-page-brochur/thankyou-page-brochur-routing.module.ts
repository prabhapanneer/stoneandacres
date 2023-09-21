import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ThankyouPageBrochurComponent } from './thankyou-page-brochur.component';

const routes: Routes = [{path:'', component: ThankyouPageBrochurComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ThankyouPageBrochurRoutingModule { }
