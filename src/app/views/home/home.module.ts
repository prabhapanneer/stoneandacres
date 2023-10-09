import { NgModule } from '@angular/core';
import { TabsModule } from 'ngx-bootstrap/tabs';

import { HomeRoutingModule } from './home-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { HomeComponent } from './home.component';
import { HomeSwiperDirective } from './directives/home-swiper.directive';
import { HomeRenderedDirective } from './directives/home-rendered.directive';
import { VideoIntersectionDirective } from './directives/video-intersection.directive';

@NgModule({
  declarations: [HomeComponent, HomeSwiperDirective, HomeRenderedDirective, VideoIntersectionDirective],
  imports: [
    TabsModule.forRoot(),
    SharedModule,
    HomeRoutingModule
  ]
})

export class HomeModule { }