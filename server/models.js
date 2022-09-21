"use strict";
exports.__esModule = true;
exports.Box = exports.Axis = exports.Token = void 0;
var Token;
(function (Token) {
    Token[Token["Blank"] = 0] = "Blank";
    Token[Token["Player"] = 1] = "Player";
    Token[Token["Computer"] = 2] = "Computer";
})(Token = exports.Token || (exports.Token = {}));
var Axis;
(function (Axis) {
    Axis[Axis["Horizontal"] = 0] = "Horizontal";
    Axis[Axis["Vertical"] = 1] = "Vertical";
})(Axis = exports.Axis || (exports.Axis = {}));
var Box = /** @class */ (function () {
    function Box(x, y, side) {
        this.x = x;
        this.y = y;
        this.side = side;
    }
    return Box;
}());
exports.Box = Box;
