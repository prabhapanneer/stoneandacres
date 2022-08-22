import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ThankyouPageComponent } from './thankyou-page.component';

const routes: Routes = [{path:'', component: ThankyouPageComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ThankyouPageRoutingModule { }
