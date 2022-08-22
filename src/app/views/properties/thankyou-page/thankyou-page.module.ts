import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';

import { ThankyouPageRoutingModule } from './thankyou-page-routing.module';
import { ThankyouPageComponent } from './thankyou-page.component';


@NgModule({
  declarations: [ThankyouPageComponent],
  imports: [
    SharedModule,
    ThankyouPageRoutingModule
  ]
})
export class ThankyouPageModule { }
