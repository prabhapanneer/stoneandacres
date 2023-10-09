import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { FooterModule } from '../../shared/modules/footer/footer.module';
// for side-cart
// import { SideCartModule } from '../../shared/modules/side-cart/side-cart.module';
// import { CustomizationModule } from '../../shared/modules/customization/customization.module';

import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';

@NgModule({
  declarations: [MainComponent],
  imports: [
    SharedModule,
    FooterModule,
    // SideCartModule,
    // CustomizationModule,
    MainRoutingModule
  ]
})

export class MainModule { }