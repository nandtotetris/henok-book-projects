"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SEGMENTS;
(function (SEGMENTS) {
    SEGMENTS[SEGMENTS["ARG"] = 1] = "ARG";
    SEGMENTS[SEGMENTS["LOCAL"] = 2] = "LOCAL";
    SEGMENTS[SEGMENTS["STATIC"] = 3] = "STATIC";
    SEGMENTS[SEGMENTS["THIS"] = 4] = "THIS";
    SEGMENTS[SEGMENTS["THAT"] = 5] = "THAT";
    SEGMENTS[SEGMENTS["POINTER"] = 6] = "POINTER";
    SEGMENTS[SEGMENTS["TEMP"] = 7] = "TEMP";
    SEGMENTS[SEGMENTS["CONSTANT"] = 8] = "CONSTANT";
})(SEGMENTS = exports.SEGMENTS || (exports.SEGMENTS = {}));
var VM_COMMANDS;
(function (VM_COMMANDS) {
    VM_COMMANDS[VM_COMMANDS["ADD"] = 0] = "ADD";
    VM_COMMANDS[VM_COMMANDS["SUB"] = 1] = "SUB";
    VM_COMMANDS[VM_COMMANDS["NEG"] = 2] = "NEG";
    VM_COMMANDS[VM_COMMANDS["EQ"] = 3] = "EQ";
    VM_COMMANDS[VM_COMMANDS["GT"] = 4] = "GT";
    VM_COMMANDS[VM_COMMANDS["LT"] = 5] = "LT";
    VM_COMMANDS[VM_COMMANDS["AND"] = 6] = "AND";
    VM_COMMANDS[VM_COMMANDS["OR"] = 7] = "OR";
    VM_COMMANDS[VM_COMMANDS["NOT"] = 8] = "NOT";
})(VM_COMMANDS = exports.VM_COMMANDS || (exports.VM_COMMANDS = {}));
var VMWritter = /** @class */ (function () {
    function VMWritter(outputFile) {
        this.data = "";
    }
    VMWritter.prototype.getData = function () {
        return this.data;
    };
    VMWritter.prototype.getSegment = function (segment) {
        if (segment === SEGMENTS.ARG)
            return "argument";
        return SEGMENTS[segment].toLowerCase();
    };
    VMWritter.prototype.getCommand = function (cmd) {
        return VM_COMMANDS[cmd].toLowerCase();
    };
    VMWritter.prototype.writePush = function (segment, index) {
        this.data += "push " + this.getSegment(segment) + " " + index + "\n";
    };
    VMWritter.prototype.writePop = function (segment, index) {
        this.data += "pop " + this.getSegment(segment) + " " + index + "\n";
    };
    VMWritter.prototype.writeArithmetic = function (command) {
        this.data += this.getCommand(command) + "\n";
    };
    VMWritter.prototype.writeLabel = function (label) {
        this.data += "label " + label + "\n";
    };
    VMWritter.prototype.writeGoto = function (label) {
        this.data += "goto " + label + "\n";
    };
    VMWritter.prototype.writeIf = function (label) {
        this.data += "if-goto " + label + "\n";
    };
    VMWritter.prototype.writeCall = function (name, nArgs) {
        this.data += "call " + name + " " + nArgs + "\n";
    };
    VMWritter.prototype.writeFunction = function (name, nLocals) {
        this.data += "function " + name + " " + nLocals + "\n";
    };
    VMWritter.prototype.writeCommand = function (command) {
        this.data += command + "\n";
    };
    VMWritter.prototype.writeReturn = function () {
        this.data += "return\n";
    };
    VMWritter.prototype.close = function () { };
    return VMWritter;
}());
exports.default = VMWritter;
