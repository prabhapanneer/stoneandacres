import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GiftcardSummaryComponent } from './giftcard-summary.component';

const routes: Routes = [{ path: "", component: GiftcardSummaryComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class GiftcardSummaryRoutingModule { }