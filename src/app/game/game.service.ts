import {EventEmitter, Injectable} from '@angular/core';
import {io} from "socket.io-client";
import {Move} from "../model/move.model";
import {Box} from "../model/box.model";
import {Axis} from "../model/axis.model";
import {Token} from "../model/token.model";
import {MessageService} from "../message.service";

@Injectable({
  providedIn: 'root'
})
export class GameService{

  socket:any;
  public player:number = 1;

  public moveEvent:EventEmitter<MoveResult> = new EventEmitter<MoveResult>();
  public disconnectEvent:EventEmitter<string> = new EventEmitter<string>();

  readonly BOARDSIZE =6;
  constructor(private messageService: MessageService) {
    this.socket = io("http://localhost:3000",{ transports : ['websocket'] });

    this.socket.on("move-result",this.handleMoveResult);
    this.socket.on("disconnect-dots",()=>this.disconnectEvent.emit("disconnected"));
    this.socket.on("debug",(message:string)=>this.messageService.add(message));
    this.socket.on("start-data",(data:any)=>{this.messageService.add("This is Player "+data);this.player = Number(data)});
  }

  makeMove(row: number, col: number, move: Token, axis: Axis) {
    let moveData:Move = {row: row, col: col, axis} as Move
    this.socket.emit("move", moveData );
  }

  handleMoveResult = (moveResult: MoveResult)=>{
    this.moveEvent.emit(moveResult);
  }

}

export interface MoveResult{
  move: Move
  newBoxes: Box[],
  turn: Token
}
