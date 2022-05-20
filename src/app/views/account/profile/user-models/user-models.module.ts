import { NgModule } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { SharedModule } from '../../../../shared/shared.module';

import { UserModelsRoutingModule } from './user-models-routing.module';
import { UserModelsComponent } from './user-models.component';

@NgModule({
  declarations: [UserModelsComponent],
  imports: [
    BsDropdownModule.forRoot(),
    NgxPaginationModule,
    SharedModule,
    UserModelsRoutingModule
  ]
})

export class UserModelsModule { }