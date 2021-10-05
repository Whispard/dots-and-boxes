import {Shape} from "createjs-module";
import {Axis} from "./axis.model";

export class Line extends Shape {
  constructor(public row:number, public col:number, public axis: Axis) {
      super();
    }
    //Include drawing and other methods here
}
