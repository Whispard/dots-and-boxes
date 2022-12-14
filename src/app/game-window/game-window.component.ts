import { Component, OnInit } from '@angular/core';
import {Token} from "../model/token.model";
import {GameService, MoveResult} from "../game/game.service";
import {MessageService} from "../message.service";
import {Line} from "../model/line.model";
import {Axis} from "../model/axis.model";
import {Box} from "../model/box.model";
import * as createjs from "createjs-module";
import {Move} from "../model/move.model";
import {Stage} from "createjs-module";

@Component({
  selector: 'app-game-window',
  templateUrl: './game-window.component.html',
  styleUrls: ['./game-window.component.css']
})
export class GameWindowComponent implements OnInit {
  private stage:any;
  turn:Token = Token.Player;

  readonly BOARDMARGIN = 70;
  readonly GAPSIZE = 70;
  readonly BOARDSIZE =6;

  constructor(public gameService: GameService,
              private messageService: MessageService) {
  }

  public ngOnInit(){
    this.gameService.moveEvent.subscribe(this.commonListener);
    this.gameService.disconnectEvent.subscribe(()=>{console.log("Redraw");this.draw()});
  }

  private commonListener = (moveResult:MoveResult)=> {
    let move: Move = moveResult.move;
    let newBoxes: Box[] = moveResult.newBoxes;
    let targetLine:Line = this.stage.children.find(
      (l:Line)=>l.row==move.row &&
        l.col==move.col &&
        l.axis== move.axis);

    targetLine.brighten(this.turn);
    console.log("Move played");
    this.turn = moveResult.turn;

    for (const box of newBoxes)
      this.renderNewBox(box);
    this.stage.update();

  }

  private horListener = (e:any) => {
    this.gameService.makeMove(e.target.row,e.target.col,this.turn,Axis.Horizontal);
    console.log("click hor listener");
  }

  private verListener = (e:any) =>{
    this.gameService.makeMove(e.target.row,e.target.col,this.turn,Axis.Vertical);console.log("click ver listener");}

  private renderNewBox(box: Box): void{
    let boxShape = new createjs.Shape();
    boxShape.graphics.beginFill(this.turn==Token.Player?"red":"blue").
    drawRect((box.x+1)*this.GAPSIZE,
      (box.y+1)*this.GAPSIZE,
      this.GAPSIZE,
      this.GAPSIZE);
    boxShape.alpha = 0.5;
    this.stage.addChild(boxShape);
  }

  private draw(): void {
    this.messageService.clear();
    if(this.stage.children.length!=0)
      this.stage.removeAllChildren();

    // Horizontal lines
    for (let row: number = 0; row < this.BOARDSIZE; row++) {
      for (let col: number = 0; col < this.BOARDSIZE - 1; col++) {
        this.drawHorLine(row, col);
      }
    }

    // Vertical lines
    for (let row: number = 0; row < this.BOARDSIZE - 1; row++) {
      for (let col: number = 0; col < this.BOARDSIZE; col++) {
        this.drawVerLine(row, col);
      }
    }

    // Dots
    for (let row: number = 0; row < this.BOARDSIZE; row++) {
      for (let col: number = 0; col < this.BOARDSIZE; col++) {
        this.drawDot(row, col);
      }
    }

    this.stage.update();
  }

  private drawDot(row: number, col: number): void {
    let dot = new createjs.Shape();
    dot.graphics.beginFill("blue")
      .drawCircle(this.BOARDMARGIN + col * this.GAPSIZE,
        this.BOARDMARGIN + row * this.GAPSIZE, 4);
    this.stage.addChild(dot);
  }

  private drawVerLine(row: number, col: number): void {
    let line = new Line(row,col,Axis.Vertical);
    line.initLine(this.stage);

    line.addEventListener("click", this.verListener);
    this.stage.addChild(line);
  }

  private drawHorLine(row: number, col: number): void {
    let line = new Line(row, col, Axis.Horizontal);
    line.initLine(this.stage);

    line.addEventListener("click", this.horListener);
    this.stage.addChild(line);
  }

  public ngAfterViewInit(){
    this.stage = new createjs.Stage("game");
    this.draw();
  }

}
