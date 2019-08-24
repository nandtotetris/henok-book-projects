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
var code_writer_1 = require("./code_writer");
var vm_commands_1 = require("./vm_commands");
var FILE_NAME_REGEX = /\.*\/*([a-zA-z_]+)\.\w+/;
var VMTranslator = /** @class */ (function () {
    function VMTranslator() {
        var _this = this;
        this.getParser = function () { return _this.parser; };
        this.getCodeWriter = function () { return _this.codeWriter; };
        this.save = function (path) {
            fs.writeFileSync(path, _this.getAssemblyCode(path));
        };
        this.getAssemblyCode = function (filePath) {
            var final_assm = "";
            _this.parser.advance();
            _this.codeWriter.setFileName(_this.getFileName(filePath));
            while (_this.parser.hasMoreCommands()) {
                switch (_this.parser.commandType()) {
                    case vm_commands_1.VM_COMMANDS.C_PUSH:
                        final_assm += _this.codeWriter.writePushPop(vm_commands_1.STACK_OPEARTIONS.C_PUSH, _this.parser.arg1(), _this.parser.arg2());
                        break;
                    case vm_commands_1.VM_COMMANDS.C_POP:
                        final_assm += _this.codeWriter.writePushPop(vm_commands_1.STACK_OPEARTIONS.C_POP, _this.parser.arg1(), _this.parser.arg2());
                        break;
                    case vm_commands_1.VM_COMMANDS.C_ARITHMETIC:
                        final_assm += _this.codeWriter.writeArithmetic(_this.parser.arg1());
                        break;
                    default:
                        final_assm += "TODO";
                        break;
                }
                _this.parser.advance();
            }
            return final_assm.trim();
        };
    }
    VMTranslator.prototype.getFileName = function (filePath) {
        return FILE_NAME_REGEX.exec(filePath)[1];
    };
    VMTranslator.createAsync = function (filePath) { return __awaiter(_this, void 0, void 0, function () {
        var translator, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    translator = new VMTranslator();
                    _a = translator;
                    return [4 /*yield*/, parser_1.default.createAsync(filePath)];
                case 1:
                    _a.parser = _b.sent();
                    translator.codeWriter = new code_writer_1.default();
                    return [2 /*return*/, translator];
            }
        });
    }); };
    return VMTranslator;
}());
VMTranslator.createAsync("../prog.vm").then(function (translator) {
    translator.save("../prog.asm");
});
