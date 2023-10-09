import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyOrdersComponent } from './my-orders.component';

const routes: Routes = [
  { path: '', component: MyOrdersComponent },
  { path: 'order-list', loadChildren: () => import('./order-list/order-list.module').then(m => m.OrderListModule) },
  { path: 'coupon-list', loadChildren: () => import('./coupon-list/coupon-list.module').then(m => m.CouponListModule) }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class MyOrdersRoutingModule { }