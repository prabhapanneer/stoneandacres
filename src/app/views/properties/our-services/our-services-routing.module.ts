import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OurServicesComponent } from './our-services.component';
const routes: Routes = [{ path: '', component: OurServicesComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OurServicesRoutingModule { }
