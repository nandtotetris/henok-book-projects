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
var code_1 = require("./code");
var symboltable_1 = require("./symboltable");
var COMMAND_TYPES;
(function (COMMAND_TYPES) {
    COMMAND_TYPES[COMMAND_TYPES["A_COMMAND"] = 1] = "A_COMMAND";
    COMMAND_TYPES[COMMAND_TYPES["C_COMMAND"] = 2] = "C_COMMAND";
    COMMAND_TYPES[COMMAND_TYPES["L_COMMAND"] = 3] = "L_COMMAND";
})(COMMAND_TYPES || (COMMAND_TYPES = {}));
var FILEDS_COMPUTE;
(function (FILEDS_COMPUTE) {
    FILEDS_COMPUTE[FILEDS_COMPUTE["HAS_DESTINATION"] = 1] = "HAS_DESTINATION";
    FILEDS_COMPUTE[FILEDS_COMPUTE["HAS_JUMP"] = 2] = "HAS_JUMP";
    FILEDS_COMPUTE[FILEDS_COMPUTE["HAS_BOTH_JUMP_AND_DESTINATION"] = 3] = "HAS_BOTH_JUMP_AND_DESTINATION";
    FILEDS_COMPUTE[FILEDS_COMPUTE["COMPUTE_ONLY"] = 4] = "COMPUTE_ONLY";
})(FILEDS_COMPUTE || (FILEDS_COMPUTE = {}));
var NOT_RESOLVED_VARIABLE = /^@[a-zA-Z_][_a-zA-Z\.\$\d]*\b/;
var VARIABLE = /^@[A-Za-z_\d][_A-Za-z\.\$\d]*\b/;
var LABEL = /\(\s*([A-Za-z_][_A-Za-z\.\$\d]*)\s*\)/;
var REMOVE_COMMENT = /\/\/[^\n]+/g;
var Parser = /** @class */ (function () {
    function Parser() {
        this.ROMInstructionIndex = 0;
        this.RAMIndex = 16;
        this.currentInstructionIndex = -1;
        this.code = new code_1.default();
        this.symTable = new symboltable_1.default();
    }
    Parser.prototype.preprocess = function () {
        var instructions = this.data.split("\n").filter(function (instruction) {
            return instruction != "";
        });
        this.instructions = instructions;
    };
    Parser.prototype.removeComment = function () {
        this.data = this.data.replace(REMOVE_COMMENT, "").trim();
    };
    Parser.prototype.isInstrctionVariable = function (instruction) {
        return VARIABLE.test(instruction);
    };
    Parser.prototype.isInstructionLabel = function (instruction) {
        return LABEL.test(instruction);
    };
    Parser.prototype.firstSymbolTablePass = function () {
        for (var i = 0; i < this.instructions.length; i++) {
            this.instructions[i] = this.instructions[i].trim();
            var instruction = this.instructions[i];
            if (this.isInstructionLabel(instruction)) {
                var symbol = LABEL.exec(instruction)[1];
                if (!this.symTable.contains(symbol)) {
                    this.symTable.addEntry(symbol, this.ROMInstructionIndex);
                }
            }
            else {
                this.ROMInstructionIndex += 1;
            }
        }
    };
    Parser.prototype.removeLabels = function () {
        this.instructions = this.instructions.filter(function (instruction) { return !LABEL.test(instruction); });
    };
    Parser.prototype.secondSymbolTablePass = function () {
        var _this = this;
        this.removeLabels();
        this.instructions = this.instructions.map(function (instruction) {
            var newInstruction = "";
            if (NOT_RESOLVED_VARIABLE.test(instruction)) {
                var symbol = instruction.slice(1);
                if (!_this.symTable.contains(symbol)) {
                    _this.symTable.addEntry(symbol, _this.RAMIndex);
                    newInstruction = "@" + _this.RAMIndex;
                    _this.RAMIndex += 1;
                }
                else {
                    newInstruction = "@" + _this.symTable.getAddress(symbol);
                }
            }
            else {
                newInstruction = instruction;
            }
            return newInstruction;
        });
    };
    Parser.prototype.hasInstructionX = function (x) {
        var command = this.currentCommand;
        var fields = command.split(x);
        return this.hasDestination(fields.length);
    };
    Parser.prototype.hasInstructionDestination = function () {
        return this.hasInstructionX("=");
    };
    Parser.prototype.hasInstructionJump = function () {
        return this.hasInstructionX(";");
    };
    Parser.prototype.getComputeFieldsType = function () {
        var fields;
        if (this.hasInstructionDestination() && this.hasInstructionJump()) {
            fields = FILEDS_COMPUTE.HAS_BOTH_JUMP_AND_DESTINATION;
        }
        else if (this.hasInstructionDestination()) {
            fields = FILEDS_COMPUTE.HAS_DESTINATION;
        }
        else if (this.hasInstructionJump()) {
            fields = FILEDS_COMPUTE.HAS_JUMP;
        }
        else {
            fields = FILEDS_COMPUTE.COMPUTE_ONLY;
        }
        return fields;
    };
    Parser.prototype.hasMoreCommands = function () {
        return this.currentInstructionIndex <= this.instructions.length - 1;
    };
    Parser.prototype.advance = function () {
        if (this.hasMoreCommands()) {
            this.currentInstructionIndex += 1;
            this.currentCommand = this.instructions[this.currentInstructionIndex];
        }
    };
    Parser.prototype.commandType = function () {
        var type;
        if (LABEL.test(this.currentCommand)) {
            type = COMMAND_TYPES.L_COMMAND;
        }
        else if (VARIABLE.test(this.currentCommand)) {
            type = COMMAND_TYPES.A_COMMAND;
        }
        else {
            type = COMMAND_TYPES.C_COMMAND;
        }
        return type;
    };
    Parser.prototype.symbol = function () {
        var currentCommandType = this.commandType();
        if (currentCommandType == COMMAND_TYPES.A_COMMAND) {
            return this.currentCommand.slice(1);
        }
    };
    Parser.prototype.dest = function () {
        var currentCommandType = this.commandType();
        var destionation;
        if (currentCommandType == COMMAND_TYPES.C_COMMAND) {
            var destMnemonic = "NULL";
            if (this.hasInstructionX("=")) {
                destMnemonic = this.currentCommand.split("=")[0].trim();
            }
            destionation = this.code.dest(destMnemonic);
        }
        return destionation;
    };
    Parser.prototype.comp = function () {
        var currentCommandType = this.commandType();
        var compute;
        if (currentCommandType == COMMAND_TYPES.C_COMMAND) {
            compute = this.getComputeField();
        }
        return this.code.comp(compute);
    };
    Parser.prototype.getComputeField = function () {
        var compute = "";
        var fields = this.getComputeFieldsType();
        switch (fields) {
            case FILEDS_COMPUTE.HAS_BOTH_JUMP_AND_DESTINATION:
                compute = this.currentCommand.split("=")[1].split(";")[0];
                break;
            case FILEDS_COMPUTE.HAS_DESTINATION:
                compute = this.currentCommand.split("=")[1];
                break;
            case FILEDS_COMPUTE.HAS_JUMP:
                compute = this.currentCommand.split(";")[0];
                break;
            default:
                compute = this.currentCommand;
                break;
        }
        return compute;
    };
    Parser.prototype.jump = function () {
        var currentCommandType = this.commandType();
        var jump;
        if (currentCommandType == COMMAND_TYPES.C_COMMAND) {
            var jumpMnemonic = "NULL";
            if (this.hasInstructionX(";")) {
                jumpMnemonic = this.currentCommand.split(";")[1].trim();
            }
            jump = jumpMnemonic;
        }
        return this.code.jump(jump);
    };
    Parser.prototype.hasDestination = function (length) {
        return length != 1;
    };
    Parser.createAsync = function (filePath) { return __awaiter(_this, void 0, void 0, function () {
        var obj, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    obj = new Parser();
                    _a = obj;
                    return [4 /*yield*/, fs.readFileSync(filePath, "utf8")];
                case 1:
                    _a.data = _b.sent();
                    obj.removeComment();
                    obj.preprocess();
                    obj.firstSymbolTablePass();
                    obj.secondSymbolTablePass();
                    return [2 /*return*/, obj];
            }
        });
    }); };
    return Parser;
}());
exports.default = Parser;
