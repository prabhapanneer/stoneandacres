import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OrderSummaryComponent } from './order-summary.component';

import { UserGuard } from '../../../guards/user.guard';
import { CheckoutGuard } from '../../../guards/checkout.guard';

const routes: Routes = [
  { path: '', component: OrderSummaryComponent },
  { path: 'product/:order_id', loadChildren: () => import('./product-summary/product-summary.module').then(m => m.ProductSummaryModule), canActivate: [CheckoutGuard] },
  { path: 'giftcard/:order_id', loadChildren: () => import('./giftcard-summary/giftcard-summary.module').then(m => m.GiftcardSummaryModule), canActivate: [UserGuard] },
  { path: 'donation/:order_id', loadChildren: () => import('./donation-summary/donation-summary.module').then(m => m.DonationSummaryModule), canActivate: [UserGuard] },
  { path: 'quotation/:order_id', loadChildren: () => import('./quote-summary/quote-summary.module').then(m => m.QuoteSummaryModule), canActivate: [CheckoutGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class OrderSummaryRoutingModule { }