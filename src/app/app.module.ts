import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app';
import { appConfig } from './app.config';
import { ChatModule } from './features/chat/chat.module';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ChatModule, // Import ChatModule eagerly
    AppComponent
  ],
  bootstrap: [AppComponent],
  providers: appConfig.providers
})
export class AppModule { }
