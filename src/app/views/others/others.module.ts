import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';

import { OthersRoutingModule } from './others-routing.module';
import { OthersComponent } from './others.component';

@NgModule({
  declarations: [OthersComponent],
  imports: [
    SharedModule,
    OthersRoutingModule
  ]
})

export class OthersModule { }