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
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var parser_1 = require("./parser");
var code_writer_1 = require("./code_writer");
var vm_commands_1 = require("./vm_commands");
var FOLDER_NAME = /\.*\/(\w+)/;
var ASSM_FILE_NAME = "main.asm";
var FILE_NAME_REGEX = /\.*\/*([a-zA-Z]+\w+\.vm)\b/;
var VM_FILE_REGEX = /(\w+)\.vm\b/;
var FIRST_MATCH = 1;
var VMTranslator = /** @class */ (function () {
    function VMTranslator() {
        var _this = this;
        this.getParser = function () { return _this.parser; };
        this.getCodeWriter = function () { return _this.codeWriter; };
        this.save = function (path) { return __awaiter(_this, void 0, void 0, function () {
            var finalAssm, outPath, isPathDir, folderName, files, vmFiles, parsersForEachVmFile, i, vmFile, parser, i, vmFile, parser, vmFileAssm, fileName, fileNameWithoutExtenstion, parser;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        finalAssm = "";
                        outPath = "";
                        isPathDir = fs.existsSync(path) && fs.lstatSync(path).isDirectory();
                        if (!isPathDir) return [3 /*break*/, 6];
                        folderName = this.getFolderName(path);
                        outPath = path + "/" + folderName + ".asm";
                        return [4 /*yield*/, this.getFilesInDirectory(path)];
                    case 1:
                        files = _a.sent();
                        vmFiles = this.filterVMFiles(files);
                        if (vmFiles.length > 1) {
                            finalAssm += this.codeWriter.writeInit();
                        }
                        parsersForEachVmFile = [];
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < vmFiles.length)) return [3 /*break*/, 5];
                        vmFile = vmFiles[i];
                        return [4 /*yield*/, parser_1.default.createAsync(path + "/" + vmFile)];
                    case 3:
                        parser = _a.sent();
                        parsersForEachVmFile.push(parser);
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5:
                        for (i = 0; i < parsersForEachVmFile.length; i++) {
                            vmFile = vmFiles[i];
                            parser = parsersForEachVmFile[i];
                            vmFileAssm = this.getAssemblyCode(vmFile, parser);
                            finalAssm += vmFileAssm;
                            finalAssm += "\n";
                        }
                        return [3 /*break*/, 8];
                    case 6:
                        fileName = this.getFileNameInRelativePath(path);
                        fileNameWithoutExtenstion = this.getFileNameWithoutExtenstion(fileName);
                        outPath = "../" + fileNameWithoutExtenstion + ".asm";
                        return [4 /*yield*/, parser_1.default.createAsync(path)];
                    case 7:
                        parser = _a.sent();
                        finalAssm = this.getAssemblyCode(fileName, parser);
                        _a.label = 8;
                    case 8:
                        fs.writeFileSync("" + outPath, finalAssm);
                        return [2 /*return*/];
                }
            });
        }); };
        this.getAssemblyCode = function (filePath, parser) {
            var final_assm = "";
            parser.advance();
            _this.codeWriter.setFileName(_this.getFileName(filePath));
            while (parser.hasMoreCommands()) {
                switch (parser.commandType()) {
                    case vm_commands_1.VM_COMMANDS.C_PUSH:
                        final_assm += _this.codeWriter.writePushPop(vm_commands_1.STACK_OPEARTIONS.C_PUSH, parser.arg1(), parser.arg2());
                        break;
                    case vm_commands_1.VM_COMMANDS.C_POP:
                        final_assm += _this.codeWriter.writePushPop(vm_commands_1.STACK_OPEARTIONS.C_POP, parser.arg1(), parser.arg2());
                        break;
                    case vm_commands_1.VM_COMMANDS.C_ARITHMETIC:
                        final_assm += _this.codeWriter.writeArithmetic(parser.arg1());
                        break;
                    case vm_commands_1.VM_COMMANDS.C_LABEL:
                        final_assm += _this.codeWriter.writeLabel(parser.arg1());
                        break;
                    case vm_commands_1.VM_COMMANDS.C_IF:
                        final_assm += _this.codeWriter.writeIf(parser.arg1(), parser.wasPrevLogicalCommand());
                        break;
                    case vm_commands_1.VM_COMMANDS.C_GOTO:
                        final_assm += _this.codeWriter.writeGoto(parser.arg1());
                        break;
                    case vm_commands_1.VM_COMMANDS.C_FUNCTION:
                        final_assm += _this.codeWriter.writeFunction(parser.arg1(), parser.arg2());
                        break;
                    case vm_commands_1.VM_COMMANDS.C_CALL:
                        final_assm += _this.codeWriter.writeCall(parser.arg1(), parser.arg2());
                        break;
                    case vm_commands_1.VM_COMMANDS.C_RETURN:
                        final_assm += _this.codeWriter.writeReturn();
                        break;
                    default:
                        final_assm += "TODOO";
                }
                parser.advance();
            }
            return final_assm.trim();
        };
    }
    VMTranslator.prototype.getFileNameWithoutExtenstion = function (path) {
        return path.split(".")[0];
    };
    VMTranslator.prototype.getFilesInDirectory = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            var files;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fs.readdirSync(path)];
                    case 1:
                        files = _a.sent();
                        return [2 /*return*/, files];
                }
            });
        });
    };
    VMTranslator.prototype.filterVMFiles = function (files) {
        return files.filter(function (file) { return VM_FILE_REGEX.test(file); });
    };
    VMTranslator.prototype.getFileNameInRelativePath = function (filePath) {
        return FILE_NAME_REGEX.exec(filePath)[FIRST_MATCH];
    };
    VMTranslator.prototype.getFolderName = function (filePath) {
        return FOLDER_NAME.exec(filePath)[FIRST_MATCH];
    };
    VMTranslator.prototype.getFileName = function (filePath) {
        return VM_FILE_REGEX.exec(filePath)[FIRST_MATCH];
    };
    VMTranslator.createTranslator = function () {
        var translator = new VMTranslator();
        translator.codeWriter = new code_writer_1.default();
        return translator;
    };
    return VMTranslator;
}());
var translator = VMTranslator.createTranslator();
translator.save("../SimpleFunction");
