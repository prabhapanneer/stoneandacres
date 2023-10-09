import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';

import { MyQuotationsRoutingModule } from './my-quotations-routing.module';
import { MyQuotationsComponent } from './my-quotations.component';

@NgModule({
  declarations: [
    MyQuotationsComponent
  ],
  imports: [
    SharedModule,
    MyQuotationsRoutingModule
  ]
})

export class MyQuotationsModule { }