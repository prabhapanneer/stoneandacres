import { NgModule } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from '../../../../shared/shared.module';

import { QuoteListRoutingModule } from './quote-list-routing.module';
import { QuoteListComponent } from './quote-list.component';

@NgModule({
  declarations: [
    QuoteListComponent
  ],
  imports: [
    SharedModule,
    NgxPaginationModule,
    QuoteListRoutingModule
  ]
})

export class QuoteListModule { }