import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ModalModule } from 'ngx-bootstrap/modal';

import { OrderSearchPipe } from './pipes/order-search.pipe';
import { OrderDescPipe } from './pipes/order-desc.pipe';
import { OrderAscPipe } from './pipes/order-asc.pipe';
import { NestedSearchPipe } from './pipes/nested-search.pipe';

import { NumberOnlyDirective } from './directives/number-only.directive';
import { UppercaseDirective } from './directives/uppercase.directive';
import { LowercaseDirective } from './directives/lowercase.directive';
import { MouseHoverDirective } from './directives/mouse-hover.directive';
import { SwiperCarousalDirective } from './directives/swiper-carousal.directive';

import { ImgLazyLoadDirective } from './directives/img-lazy-load.directive';
import { LqimgLoadDirective } from './directives/lqimg-load.directive';
import { DeferLoadDirective } from './directives/defer-load.directive';
import { ImgIntersectionDirective } from './directives/img-intersection.directive';
import { ImgBrokenDirective } from './directives/img-broken.directive';

import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { FooterComponent } from './components/footer/footer.component';

@NgModule({
  declarations: [
    OrderSearchPipe,
    OrderDescPipe,
    OrderAscPipe,
    NestedSearchPipe,

    NumberOnlyDirective,
    UppercaseDirective,
    LowercaseDirective,
    MouseHoverDirective,
    SwiperCarousalDirective,

    ImgLazyLoadDirective,
    LqimgLoadDirective,
    DeferLoadDirective,
    ImgIntersectionDirective,
    ImgBrokenDirective,

    LoadingSpinnerComponent,
    FooterComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ModalModule.forRoot()
  ],
  exports: [
    OrderSearchPipe,
    OrderDescPipe,
    OrderAscPipe,
    NestedSearchPipe,

    NumberOnlyDirective,
    UppercaseDirective,
    LowercaseDirective,
    MouseHoverDirective,
    SwiperCarousalDirective,

    ImgLazyLoadDirective,
    LqimgLoadDirective,
    DeferLoadDirective,
    ImgIntersectionDirective,
    ImgBrokenDirective,
    
    LoadingSpinnerComponent,
    FooterComponent,

    CommonModule,
    FormsModule,
    RouterModule,
    ModalModule
  ]
})

export class SharedModule { }