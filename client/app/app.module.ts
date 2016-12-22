import { NgModule } from '@angular/core';
import { BrowserModule  } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
//import { AppRoutingModule } from './app.routing'; //TODO: Create app.routing

import { HelpscoutService } from './helpscout.service';
import { MysqlService } from './mysql.service';

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule

 //   AppRoutingModule,
  ],
  declarations: [AppComponent],
  providers: [HelpscoutService, MysqlService],
  bootstrap: [AppComponent]
})
export class AppModule { }
