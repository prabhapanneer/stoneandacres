import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ModalModule } from 'ngx-bootstrap/modal';

import { FieldSearchPipe } from './pipes/field-search.pipe';
import { OrderDescPipe } from './pipes/order-desc.pipe';
import { OrderAscPipe } from './pipes/order-asc.pipe';
import { SortAscPipe } from './pipes/sort-asc.pipe';

import { NumberOnlyDirective } from './directives/number-only.directive';
import { LowercaseDirective } from './directives/lowercase.directive';
import { MouseHoverDirective } from './directives/mouse-hover.directive';

import { ImgLazyLoadDirective } from './directives/img-lazy-load.directive';
import { LqimgLoadDirective } from './directives/lqimg-load.directive';
import { DeferLoadDirective } from './directives/defer-load.directive';
import { ImgIntersectionDirective } from './directives/img-intersection.directive';
import { ImgBrokenDirective } from './directives/img-broken.directive';
import { SmallImgDirective } from './directives/small-img.directive';

import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';

@NgModule({
  declarations: [
    FieldSearchPipe,
    OrderDescPipe,
    OrderAscPipe,
    SortAscPipe,

    NumberOnlyDirective,
    LowercaseDirective,
    MouseHoverDirective,

    ImgLazyLoadDirective,
    LqimgLoadDirective,
    DeferLoadDirective,
    ImgIntersectionDirective,
    ImgBrokenDirective,
    SmallImgDirective,

    LoadingSpinnerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ModalModule.forRoot()
  ],
  exports: [
    FieldSearchPipe,
    OrderDescPipe,
    OrderAscPipe,
    SortAscPipe,

    NumberOnlyDirective,
    LowercaseDirective,
    MouseHoverDirective,

    ImgLazyLoadDirective,
    LqimgLoadDirective,
    DeferLoadDirective,
    ImgIntersectionDirective,
    ImgBrokenDirective,
    SmallImgDirective,
    
    LoadingSpinnerComponent,

    CommonModule,
    FormsModule,
    RouterModule,
    ModalModule
  ]
})

export class SharedModule { }