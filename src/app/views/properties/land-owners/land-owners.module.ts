import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';

import { LandOwnersRoutingModule } from './land-owners-routing.module';
import { LandOwnersComponent } from './land-owners.component';


@NgModule({
  declarations: [LandOwnersComponent],
  imports: [
    SharedModule,
    LandOwnersRoutingModule
  ]
})
export class LandOwnersModule { }
