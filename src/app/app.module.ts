import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import {GameService} from "./game/game.service";
import { GameWindowComponent } from './game-window/game-window.component';
import { MessagesComponent } from './messages/messages.component';
import {MessageService} from "./message.service";

@NgModule({
  declarations: [
    AppComponent,
    GameWindowComponent,
    MessagesComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [GameService,MessageService],
  bootstrap: [AppComponent]
})
export class AppModule { }
