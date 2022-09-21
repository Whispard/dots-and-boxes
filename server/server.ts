import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { Axis, Box, Token, MoveResult, Move } from "./models";
import * as path from "path";
import * as express from "express";
import * as logger from 'morgan';


const httpServer = createServer();
const io = new Server(httpServer, {});

export const app = express();
const __dirname = path.resolve(".");
console.log(__dirname);

let hors:Token[][] = [];
let vers:Token[][] = [];
let boxes: Box[] = [];
let turn:Token = Token.Player;
let playerSocks:Socket[] = [];
let player1Id:string,player2Id:string;

const BOARDSIZE =6;


function initializeGame(){
    hors = new Array(BOARDSIZE-1).fill(Token.Blank)
    .map(()=>new Array(BOARDSIZE).fill(Token.Blank));
    vers = new Array(BOARDSIZE).fill(Token.Blank)
    .map(()=>new Array(BOARDSIZE-1).fill(Token.Blank));
    console.log("Started new game");
}

initializeGame();
// httpServer.listen(3000,()=>{
//     console.log("Listening")
// });

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, './dist/multiGame')));
app.get('/*', function(req, res) {
  console.log("umm");
  res.sendFile('index.html',{root:path.join(__dirname, './dist/multiGame')});
});

console.log(path.join(__dirname, './dist/multiGame'))
app.listen(process.env.PORT || 8080);

function getNewBoxes(): Box[] {
    let newBoxes:Box[] = [];
    let newBox:Box = new Box(-1,-1,Token.Blank);
    for (let x = 0; x < BOARDSIZE-1; x++) {
      for (let y = 0; y < BOARDSIZE-1; y++) {
        if (boxes.findIndex(box=>box.x===x && box.y===y)==-1 &&
          hors[x][y] && hors[x][y+1] &&
          vers[x][y] && vers[x+1][y]) {
          newBox = new Box(x,y,turn);
          boxes.push(newBox);
          newBoxes.push(newBox);
        }
      }
    }
    return newBoxes;
  }

function debug(message: string){
    io.emit("debug",message);
}

io.on("connection",socket => {
    playerSocks.push(socket);
    if(playerSocks.length==2){
        console.log("CONNECT");
        playerSocks[0].emit("start-data","1");
        playerSocks[1].emit("start-data","2");
        player1Id = playerSocks[0].id;
        player2Id = playerSocks[1].id;

        // Redraw is done in disconnect event instead of connect event
        io.emit("disconnect-dots");
        initializeGame();
    }

    socket.on("move",(move:Move):void =>{
        console.log("Someone moving");
        if(playerSocks.length<2){
            socket.emit("debug","Wait for other players to join");
            return;
        }


        if(!((player1Id == socket.id && turn == Token.Player) || (player2Id == socket.id && turn == Token.Computer))){
            socket.emit("debug","This is not your turn");
            return;
        }

        if(move.axis==Axis.Horizontal && hors[move.col][move.row] == Token.Blank)
            hors[move.col][move.row] = turn;
        else if (move.axis==Axis.Vertical && vers[move.col][move.row]==Token.Blank)
            vers[move.col][move.row] = turn;
        else {
            socket.emit("debug","Can't draw on already drawn!");
            return;
        }

        io.emit("debug","Player "+turn+" moved");
        let newBoxes = getNewBoxes();
        if(newBoxes.length==0)
            turn = turn==Token.Player?Token.Computer:Token.Player;
        else
            io.emit("debug","Player "+turn+" got Extra Turn");

        console.log(turn,newBoxes);
        io.emit("move-result", {
            turn,
            newBoxes,
            move
        } as MoveResult,);
    })


    socket.on("disconnect",()=>{
        console.log("Disconnected");
        io.emit("disconnect-dots");
        let i = playerSocks.indexOf(socket);
        playerSocks.splice(i,1);
    });


})

