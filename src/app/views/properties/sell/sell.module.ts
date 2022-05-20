import { NgModule } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { AccordionModule } from 'ngx-bootstrap/accordion';

import { SellRoutingModule } from './sell-routing.module';
import { SellComponent } from './sell.component';


@NgModule({
  declarations: [SellComponent],
  imports: [
    SharedModule,
    SellRoutingModule,
    AccordionModule.forRoot()
  ]
})
export class SellModule { }
