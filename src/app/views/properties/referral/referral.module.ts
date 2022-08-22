import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';

import { ReferralRoutingModule } from './referral-routing.module';
import { ReferralComponent } from './referral.component';


@NgModule({
  declarations: [ReferralComponent],
  imports: [
    SharedModule,
    ReferralRoutingModule
  ]
})
export class ReferralModule { }
