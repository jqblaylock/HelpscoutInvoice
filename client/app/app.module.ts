import { NgModule } from '@angular/core';
import { BrowserModule  } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
//import { AppRoutingModule } from './app.routing'; //TODO: Create app.routing

import { HelpscoutService } from'./helpscout.service';

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule

 //   AppRoutingModule,
  ],
  declarations: [AppComponent],
  providers: [HelpscoutService],
  bootstrap: [AppComponent]
})
export class AppModule { }
