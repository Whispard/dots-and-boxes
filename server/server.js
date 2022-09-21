"use strict";
exports.__esModule = true;
exports.app = void 0;
var http_1 = require("http");
var socket_io_1 = require("socket.io");
var models_1 = require("./models");
var path = require("path");
var express = require("express");
var httpServer = http_1.createServer();
var io = new socket_io_1.Server(httpServer, {});
exports.app = express();
var __dirname = path.resolve(".");
console.log(__dirname);
var hors = [];
var vers = [];
var boxes = [];
var turn = models_1.Token.Player;
var playerSocks = [];
var player1Id, player2Id;
var BOARDSIZE = 6;
function initializeGame() {
    hors = new Array(BOARDSIZE - 1).fill(models_1.Token.Blank)
        .map(function () { return new Array(BOARDSIZE).fill(models_1.Token.Blank); });
    vers = new Array(BOARDSIZE).fill(models_1.Token.Blank)
        .map(function () { return new Array(BOARDSIZE - 1).fill(models_1.Token.Blank); });
    console.log("Started new game");
}
initializeGame();
httpServer.listen(3000, function () {
    console.log("Listening");
});
exports.app.use(express.static(path.join(__dirname, 'dist/multiGame')));
exports.app.get('/*', function (req, res) {
    res.sendFile('index.html', { root: path.join(__dirname, '../dist/multiGame') });
});
exports.app.listen(process.env.PORT || 3000);
function getNewBoxes() {
    var newBoxes = [];
    var newBox = new models_1.Box(-1, -1, models_1.Token.Blank);
    var _loop_1 = function (x) {
        var _loop_2 = function (y) {
            if (boxes.findIndex(function (box) { return box.x === x && box.y === y; }) == -1 &&
                hors[x][y] && hors[x][y + 1] &&
                vers[x][y] && vers[x + 1][y]) {
                newBox = new models_1.Box(x, y, turn);
                boxes.push(newBox);
                newBoxes.push(newBox);
            }
        };
        for (var y = 0; y < BOARDSIZE - 1; y++) {
            _loop_2(y);
        }
    };
    for (var x = 0; x < BOARDSIZE - 1; x++) {
        _loop_1(x);
    }
    return newBoxes;
}
function debug(message) {
    io.emit("debug", message);
}
io.on("connection", function (socket) {
    playerSocks.push(socket);
    if (playerSocks.length == 2) {
        console.log("CONNECT");
        playerSocks[0].emit("start-data", "1");
        playerSocks[1].emit("start-data", "2");
        player1Id = playerSocks[0].id;
        player2Id = playerSocks[1].id;
        // Redraw is done in disconnect event instead of connect event
        io.emit("disconnect-dots");
        initializeGame();
    }
    socket.on("move", function (move) {
        console.log("Someone moving");
        if (playerSocks.length < 2) {
            socket.emit("debug", "Wait for other players to join");
            return;
        }
        if (!((player1Id == socket.id && turn == models_1.Token.Player) || (player2Id == socket.id && turn == models_1.Token.Computer))) {
            socket.emit("debug", "This is not your turn");
            return;
        }
        if (move.axis == models_1.Axis.Horizontal && hors[move.col][move.row] == models_1.Token.Blank)
            hors[move.col][move.row] = turn;
        else if (move.axis == models_1.Axis.Vertical && vers[move.col][move.row] == models_1.Token.Blank)
            vers[move.col][move.row] = turn;
        else {
            socket.emit("debug", "Can't draw on already drawn!");
            return;
        }
        io.emit("debug", "Player " + turn + " moved");
        var newBoxes = getNewBoxes();
        if (newBoxes.length == 0)
            turn = turn == models_1.Token.Player ? models_1.Token.Computer : models_1.Token.Player;
        else
            io.emit("debug", "Player " + turn + " got Extra Turn");
        console.log(turn, newBoxes);
        io.emit("move-result", {
            turn: turn,
            newBoxes: newBoxes,
            move: move
        });
    });
    socket.on("disconnect", function () {
        console.log("Disconnected");
        io.emit("disconnect-dots");
        var i = playerSocks.indexOf(socket);
        playerSocks.splice(i, 1);
    });
});
