import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  public messages: string[] = [];
  constructor() { }

  add(message: string){
    this.messages.push(message);
    if(this.messages.length>20){
      this.clear();
    }
  }

  clear() {
    this.messages = [];
  }
}
