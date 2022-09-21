export enum Token {
    Blank,
    Player,
    Computer
}

export enum Axis{
    Horizontal,
    Vertical
  }

export class Box {
    constructor(public x: number, public y: number, public side: Token) {
    }
}

export interface MoveResult{
    move: Move,
    newBoxes: Box[],
    turn: Token
  }

export interface Move{
  row: number,
  col: number,
  axis: Axis
}
