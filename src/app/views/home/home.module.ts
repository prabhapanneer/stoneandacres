import { NgModule } from '@angular/core';
import { TabsModule } from 'ngx-bootstrap/tabs';

import { HomeRoutingModule } from './home-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { HomeComponent } from './home.component';
import { HomeSwiperDirective } from './directives/home-swiper.directive';

@NgModule({
  declarations: [HomeComponent, HomeSwiperDirective],
  imports: [
    TabsModule.forRoot(),
    SharedModule,
    HomeRoutingModule
  ]
})

export class HomeModule { }