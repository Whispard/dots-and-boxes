import {Component} from '@angular/core';
import * as createjs from "createjs-module";
import {Token} from "./model/token.model";
import {Box} from "./model/box.model";
import {Line} from "./model/line.model";
import {Axis} from "./model/axis.model";
import {GameService, MoveResult} from "./game/game.service";
import {MessageService} from "./message.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

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
    let move = moveResult.move;
    let newBoxes = moveResult.newBoxes;
    let targetLine = this.stage.children.find(
      (l:Line)=>l.row==move.row &&
        l.col==move.col &&
        l.axis== move.axis);

    this.drawBrightLine(targetLine);
    this.turn = moveResult.turn;

    for (const box of newBoxes)
      this.renderNewBox(box);
    this.stage.update();
  }

  private horListener = (e:any) =>
    this.gameService.makeMove(e.target.row,e.target.col,this.turn,Axis.Horizontal);

  private verListener = (e:any) =>
    this.gameService.makeMove(e.target.row,e.target.col,this.turn,Axis.Vertical);

  private drawBrightLine(line: Line){
    if(line.axis==Axis.Horizontal)
      line.graphics.beginFill(this.turn==Token.Player?"red":"blue").drawRect(0,0,this.GAPSIZE-8,4);
    else
      line.graphics.beginFill(this.turn==Token.Player?"red":"blue").drawRect(0, 0, 4, this.GAPSIZE - 8);
    line.mouseEnabled = false;
    console.log("Line drawn");
  }

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
    //line.graphics.beginFill("white").drawRect(-1, 0, 7, this.GAPSIZE);
    line.x = this.BOARDMARGIN + col * this.GAPSIZE - 3;
    line.y = this.BOARDMARGIN + row * this.GAPSIZE + 3;

    let hitArea = new createjs.Shape();
    hitArea.graphics.beginFill("#000").drawRect(-10, 0, 24, this.GAPSIZE);
    // hitArea.x = line.x;
    // hitArea.y = line.y;
    //this.stage.addChild(hitArea);
    line.hitArea = hitArea;

    line.addEventListener("click", this.verListener);
    // line.addEventListener("mouseover",
    //   (event: any) => this.mouseOverListener(event.target));
    //
    // line.addEventListener("mouseout",
    //   (event:any) => this.mouseOutListener(event.target));
    this.stage.addChild(line);
  }

  private drawHorLine(row: number, col: number): void {
    let line = new Line(row, col, Axis.Horizontal);

    //line.graphics.beginFill("white").drawRect(0, -3, this.GAPSIZE - 8, 4 + 8);

    line.x = this.BOARDMARGIN + col * this.GAPSIZE + 3;
    line.y = this.BOARDMARGIN - 1 + row * this.GAPSIZE - 2;

    let hitArea = new createjs.Shape();
    hitArea.graphics.beginFill("#000").drawRect(0, -12, this.GAPSIZE - 8, 4 + 8 + 12 + 4);
    //hitArea.x = line.x;
    //hitArea.y = line.y;
    //this.stage.addChild(hitArea);
    line.hitArea = hitArea;


    line.addEventListener("click", this.horListener);
    // line.addEventListener("mouseover",
    //   (event: any) => this.mouseOverListener(event.target));

    // This listener isn't the reason
    // line.addEventListener("mouseout",
    //   (event:any) => this.mouseOutListener(event.target));

    this.stage.addChild(line);
  }

  mouseOverListener = (line:Line)=>{
    //possibly this listener and turn result etc things are racing
    //if(this.turn!=this.gameService.player)
    //  return

    if(line.axis == Axis.Horizontal)
      line.graphics.beginFill(this.turn == Token.Player ? "red" : "blue").drawRect(0, 0, this.GAPSIZE - 8, 4);
    else
      line.graphics.beginFill(this.turn == Token.Player ? "red" : "blue").drawRect(0, 0,4,  this.GAPSIZE - 8);
    line.alpha = 0.5;
    //console.log("IN");
    this.stage.update();
  }

  mouseOutListener = (line: Line)=>{
    if(!line.mouseEnabled)
      return

    //console.log("OUT")

    // I logged this out means this isn't it's reason then?
    //line.graphics.clear();
    line.alpha = 0;
    this.stage.update();
  };

  public ngAfterViewInit(){
    this.stage = new createjs.Stage("game");
    this.stage.enableMouseOver();
    this.draw();
  }

}
