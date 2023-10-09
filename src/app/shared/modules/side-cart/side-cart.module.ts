import { NgModule } from '@angular/core';
import { SideCartComponent } from './side-cart.component';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  declarations: [SideCartComponent],
  imports: [SharedModule],
  exports: [SideCartComponent]
})

export class SideCartModule { }