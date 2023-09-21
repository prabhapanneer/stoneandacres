import { NgModule } from '@angular/core';

import { ThankyouPageBrochurRoutingModule } from './thankyou-page-brochur-routing.module';
import { ThankyouPageBrochurComponent } from './thankyou-page-brochur.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [ThankyouPageBrochurComponent],
  imports: [
    SharedModule,
    ThankyouPageBrochurRoutingModule
  ]
})
export class ThankyouPageBrochurModule { }
