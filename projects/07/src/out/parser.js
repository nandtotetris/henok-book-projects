"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var vm_commands_1 = require("./vm_commands");
var NOT_FOUND = -1;
var FIRST_MATCH = 1;
var SECOND_MATCH = 2;
var EMPTY_LINE = /\s*/;
var REMOVE_COMMENT = /\/\/\s*[^\n]+/g;
var PUSH_COMMAND = /^push\s+([a-z]+)\s+(\d+)\b/;
var POP_COMMAND = /^pop\s+([a-z]+)\s+(\d+)\b/;
var LABEL_COMMAND = /^label\s+([a-zA-Z][a-zA-Z_\.\d]+)\b/;
var GOTO_COMMAND = /^goto\s+([a-zA-Z][a-zA-Z_\.\d]+)\b/;
var IF_COMMAND = /^if-goto\s+([a-zA-Z][a-zA-Z_\.\d]+)\b/;
var FUNCTION_COMMAND = /^function\s+([a-zA-Z][a-zA-Z_\.\d]+)\s+(\d+)\b/;
var RETURN_COMMAND = /^return/;
var CALL_COMMAND = /^call\s+([a-zA-Z][a-zA-Z_\.\d]+)\s+(\d+)\b/;
var ARITHMETIC = ["add", "sub", "neg", "eq", "gt", "lt", "and", "or", "not"];
var Parser = /** @class */ (function () {
    function Parser() {
        var _this = this;
        this.currentIndex = -1;
        this.getVMCommands = function () { return _this.vm_commands; };
        this.getCurrentCommand = function () { return _this.currentCommand; };
    }
    Parser.prototype.wasPrevLogicalCommand = function () {
        var prevIndex = this.currentIndex - 1;
        return (["eq", "lt", "gt"].indexOf(this.vm_commands[prevIndex]) !== NOT_FOUND);
    };
    Parser.prototype.preprocess = function () {
        var splitCommands = this.data.split("\n");
        var vm_commands = splitCommands.filter(function (instruction) {
            return instruction.length > 1;
        });
        this.vm_commands = this.trimCommands(vm_commands);
    };
    Parser.prototype.trimCommands = function (vmCommands) {
        var sanitizedCommands = vmCommands.map(function (vmCommand) {
            return vmCommand.trim();
        });
        return sanitizedCommands;
    };
    Parser.prototype.removeComment = function () {
        this.data = this.data.replace(REMOVE_COMMENT, "").trim();
    };
    Parser.prototype.hasMoreCommands = function () {
        return this.currentIndex < this.vm_commands.length;
    };
    Parser.prototype.advance = function () {
        if (this.hasMoreCommands()) {
            this.currentIndex += 1;
            this.currentCommand = this.vm_commands[this.currentIndex];
        }
    };
    Parser.prototype.commandType = function () {
        var type;
        if (PUSH_COMMAND.test(this.currentCommand)) {
            type = vm_commands_1.VM_COMMANDS.C_PUSH;
        }
        else if (POP_COMMAND.test(this.currentCommand)) {
            type = vm_commands_1.VM_COMMANDS.C_POP;
        }
        else if (this.isCommandArithmetic(this.currentCommand)) {
            type = vm_commands_1.VM_COMMANDS.C_ARITHMETIC;
        }
        else if (LABEL_COMMAND.test(this.currentCommand)) {
            type = vm_commands_1.VM_COMMANDS.C_LABEL;
        }
        else if (GOTO_COMMAND.test(this.currentCommand)) {
            type = vm_commands_1.VM_COMMANDS.C_GOTO;
        }
        else if (IF_COMMAND.test(this.currentCommand)) {
            type = vm_commands_1.VM_COMMANDS.C_IF;
        }
        else if (FUNCTION_COMMAND.test(this.currentCommand)) {
            type = vm_commands_1.VM_COMMANDS.C_FUNCTION;
        }
        else if (CALL_COMMAND.test(this.currentCommand)) {
            type = vm_commands_1.VM_COMMANDS.C_CALL;
        }
        else if (RETURN_COMMAND.test(this.currentCommand)) {
            type = vm_commands_1.VM_COMMANDS.C_RETURN;
        }
        return type;
    };
    Parser.prototype.isCommandArithmetic = function (vmCommand) {
        return ARITHMETIC.indexOf(vmCommand) !== NOT_FOUND;
    };
    Parser.prototype.arg1 = function () {
        var firstArgument;
        switch (this.commandType()) {
            case vm_commands_1.VM_COMMANDS.C_ARITHMETIC:
                firstArgument = this.currentCommand;
                break;
            case vm_commands_1.VM_COMMANDS.C_POP:
                firstArgument = POP_COMMAND.exec(this.currentCommand)[FIRST_MATCH];
                break;
            case vm_commands_1.VM_COMMANDS.C_PUSH:
                firstArgument = PUSH_COMMAND.exec(this.currentCommand)[FIRST_MATCH];
                break;
            case vm_commands_1.VM_COMMANDS.C_LABEL:
                firstArgument = LABEL_COMMAND.exec(this.currentCommand)[FIRST_MATCH];
                break;
            case vm_commands_1.VM_COMMANDS.C_GOTO:
                firstArgument = GOTO_COMMAND.exec(this.currentCommand)[FIRST_MATCH];
                break;
            case vm_commands_1.VM_COMMANDS.C_IF:
                firstArgument = IF_COMMAND.exec(this.currentCommand)[FIRST_MATCH];
                break;
            case vm_commands_1.VM_COMMANDS.C_FUNCTION:
                firstArgument = FUNCTION_COMMAND.exec(this.currentCommand)[FIRST_MATCH];
                break;
            case vm_commands_1.VM_COMMANDS.C_CALL:
                firstArgument = CALL_COMMAND.exec(this.currentCommand)[FIRST_MATCH];
                break;
            default:
                firstArgument = "TODO";
        }
        return firstArgument;
    };
    Parser.prototype.arg2 = function () {
        var secondArgument;
        switch (this.commandType()) {
            case vm_commands_1.VM_COMMANDS.C_POP:
                secondArgument = parseInt(POP_COMMAND.exec(this.currentCommand)[SECOND_MATCH]);
                break;
            case vm_commands_1.VM_COMMANDS.C_PUSH:
                secondArgument = parseInt(PUSH_COMMAND.exec(this.currentCommand)[SECOND_MATCH]);
                break;
            case vm_commands_1.VM_COMMANDS.C_FUNCTION:
                secondArgument = parseInt(FUNCTION_COMMAND.exec(this.currentCommand)[SECOND_MATCH]);
                break;
            case vm_commands_1.VM_COMMANDS.C_CALL:
                secondArgument = parseInt(CALL_COMMAND.exec(this.currentCommand)[SECOND_MATCH]);
                break;
        }
        return secondArgument;
    };
    Parser.createAsync = function (filePath) { return __awaiter(_this, void 0, void 0, function () {
        var parser, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    parser = new Parser();
                    _a = parser;
                    return [4 /*yield*/, fs.readFileSync(filePath, "utf8")];
                case 1:
                    _a.data = _b.sent();
                    parser.removeComment();
                    parser.preprocess();
                    return [2 /*return*/, parser];
            }
        });
    }); };
    return Parser;
}());
exports.default = Parser;
