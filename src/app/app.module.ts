import { NgModule, APP_INITIALIZER } from '@angular/core';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { QuicklinkModule } from 'ngx-quicklink';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { StartupService } from './services/startup.service';

export function startupServiceFactory(startupService: StartupService): Function {
  return () => startupService.load();
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    BrowserAnimationsModule,
    AppRoutingModule,
    QuicklinkModule,
    NgOptimizedImage,
    HttpClientModule
  ],
  providers: [
    DatePipe,
    {
      provide: APP_INITIALIZER,
      useFactory: startupServiceFactory,
      deps: [StartupService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }