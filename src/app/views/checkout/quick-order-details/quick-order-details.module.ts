import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { CustomizationModule } from '../../../shared/modules/customization/customization.module';

import { QuickOrderDetailsRoutingModule } from './quick-order-details-routing.module';
import { QuickOrderDetailsComponent } from './quick-order-details.component';

@NgModule({
  declarations: [QuickOrderDetailsComponent],
  imports: [
    SharedModule,
    CustomizationModule,
    QuickOrderDetailsRoutingModule
  ]
})

export class QuickOrderDetailsModule { }