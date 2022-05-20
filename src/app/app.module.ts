import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { QuicklinkModule } from 'ngx-quicklink';
import { DeviceDetectorService } from 'ngx-device-detector';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { SharedModule } from './shared/shared.module';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    HammerModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    QuicklinkModule,
    SharedModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [DatePipe, DeviceDetectorService],
  bootstrap: [AppComponent]
})

export class AppModule { }