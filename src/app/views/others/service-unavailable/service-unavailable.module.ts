import { NgModule } from '@angular/core';

import { ServiceUnavailableRoutingModule } from './service-unavailable-routing.module';
import { ServiceUnavailableComponent } from './service-unavailable.component';

@NgModule({
  declarations: [ServiceUnavailableComponent],
  imports: [
    ServiceUnavailableRoutingModule
  ]
})

export class ServiceUnavailableModule { }