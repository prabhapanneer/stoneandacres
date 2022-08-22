import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandOwnersComponent } from './land-owners.component';

const routes: Routes = [{ path: '', component: LandOwnersComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LandOwnersRoutingModule { }
