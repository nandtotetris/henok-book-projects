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
var parser_1 = require("./parser");
var Assembler = /** @class */ (function () {
    function Assembler() {
        var _this = this;
        this.binaryCode = "";
        this.save = function (path) {
            fs.writeFileSync(path, _this.getMachineCode());
        };
        this.getParser = function () { return _this.parser; };
    }
    Assembler.prototype.getAMachineCode = function () {
        var symbol = this.parser.symbol();
        var binarySymbol = this.pad16bit(Number(symbol).toString(2));
        return "0" + binarySymbol;
    };
    Assembler.prototype.getCMachineCode = function () {
        var code = "111";
        code += this.parser.comp();
        code += this.parser.dest();
        code += this.parser.jump();
        return code;
    };
    Assembler.prototype.pad16bit = function (binary) {
        var len = binary.length;
        if (len <= 15) {
            var diff = 15 - len;
            binary = this.getZeros(diff) + binary;
        }
        return binary;
    };
    Assembler.prototype.getZeros = function (num) {
        var result = "";
        for (var i = 1; i <= num; i++) {
            result += "0";
        }
        return result;
    };
    Assembler.prototype.getMachineCode = function () {
        this.parser.advance();
        while (this.parser.hasMoreCommands()) {
            switch (this.parser.commandType()) {
                case 1:
                    this.binaryCode += this.getAMachineCode();
                    this.binaryCode += "\n";
                    break;
                case 2:
                    this.binaryCode += this.getCMachineCode();
                    this.binaryCode += "\n";
                    break;
            }
            this.parser.advance();
        }
        return this.binaryCode.trim();
    };
    Assembler.createAsync = function (filePath) { return __awaiter(_this, void 0, void 0, function () {
        var obj, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    obj = new Assembler();
                    _a = obj;
                    return [4 /*yield*/, parser_1.default.createAsync(filePath)];
                case 1:
                    _a.parser = _b.sent();
                    return [2 /*return*/, obj];
            }
        });
    }); };
    return Assembler;
}());
var assembler = Assembler.createAsync("../prog.asm");
assembler.then(function (assembler) {
    assembler.save("../prog.hack");
});
