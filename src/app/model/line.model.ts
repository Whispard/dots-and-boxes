import * as createjs from "createjs-module";
import {Shape, Stage} from "createjs-module";
import {Axis} from "./axis.model";
import {Token} from "./token.model";

export class Line extends Shape {
  readonly GAPSIZE = 70;
  readonly BOARDMARGIN = 70;

  constructor(public row: number, public col: number, public axis: Axis) {
    super();
  }

  //Include drawing and other methods here

  public brighten(turn: Token) {
    if (this.axis == Axis.Horizontal)
      this.graphics.beginFill(turn == Token.Player ? "red" : "blue").drawRect(0, 0, this.GAPSIZE - 8, 4);
    else
      this.graphics.beginFill(turn == Token.Player ? "red" : "blue").drawRect(0, 0, 4, this.GAPSIZE - 8);
    //let newLine = new Line(this.row,)
    console.log("Line drawn");
  }

  public initLine(stage: Stage) {
    let hitBox = new createjs.Shape();
    if (this.axis == Axis.Horizontal) {
      this.x = this.BOARDMARGIN + this.col * this.GAPSIZE + 3;
      this.y = this.BOARDMARGIN - 1 + this.row * this.GAPSIZE - 2;
      hitBox.graphics.beginFill("gray").drawRect(0, -12, this.GAPSIZE - 5, 4 + 8 + 12 + 4);
    } else {
      this.x = this.BOARDMARGIN + this.col * this.GAPSIZE - 3;
      this.y = this.BOARDMARGIN + this.row * this.GAPSIZE + 3;
      hitBox.graphics.beginFill("white").drawRect(-10, 0, 24, this.GAPSIZE);

    }
      this.hitArea = hitBox;
  }

}
