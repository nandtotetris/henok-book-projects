"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vm_commands_1 = require("./vm_commands");
var UNIARY_COMMANDS = ["neg", "not"];
var NOT_FOUND = -1;
var TEMP = 5;
var FRAME = "R13";
var RET = "R14";
var POINTER = 3;
var RETURN_ADDRESS = "RETURN_ADDRESS";
var CodeWriter = /** @class */ (function () {
    function CodeWriter() {
        this.label = 1;
        this.returnIndex = 1;
    }
    CodeWriter.prototype.setFileName = function (fileName) {
        this.fileName = fileName;
    };
    CodeWriter.prototype.writeBinaryArithmetic = function (command) {
        var binaryAssm = "";
        switch (command) {
            case "add":
                binaryAssm = this.getArthimeticAssm("+");
                break;
            case "sub":
                binaryAssm = this.getSubAssm("-");
                break;
            case "and":
                binaryAssm = this.getArthimeticAssm("&");
                break;
            case "or":
                binaryAssm = this.getArthimeticAssm("|");
                break;
            case "eq":
                binaryAssm = this.getLogicalAssm("JNE");
                break;
            case "gt":
                binaryAssm = this.getLogicalAssm("JGE");
                break;
            case "lt":
                binaryAssm = this.getLogicalAssm("JLE");
                break;
            default:
                binaryAssm = "TODO";
                break;
        }
        return binaryAssm;
    };
    CodeWriter.prototype.getBinaryAssm = function (dependentAssm) {
        var assm = this.popStack("D");
        assm += this.popStack("A");
        assm += dependentAssm;
        assm += this.incSP();
        return assm;
    };
    CodeWriter.prototype.getUniaryAssm = function (dependentAssm) {
        var assm = this.popStack("D");
        assm += dependentAssm;
        assm += this.incSP();
        return assm;
    };
    CodeWriter.prototype.getNegAssm = function () {
        return this.getUniaryAssm("D=-D\n");
    };
    CodeWriter.prototype.getNotAssm = function () {
        return this.getUniaryAssm("D=!D\n");
    };
    CodeWriter.prototype.getSubAssm = function (operation) {
        return this.getArthimeticAssm(operation) + this.getNegAssm();
    };
    CodeWriter.prototype.getArthimeticAssm = function (operation) {
        return this.getBinaryAssm("D=D" + operation + "A\n");
    };
    CodeWriter.prototype.getLogicalAssm = function (jump) {
        var assm = "D=D-A\n@EQUAL_" +
            this.label +
            "\nD;" +
            jump +
            "\nD=-1\n@END_EQUAL_" +
            this.label +
            "\n0;JMP\n(EQUAL_" +
            this.label +
            ")\nD=0\n(END_EQUAL_" +
            this.label +
            ")\n";
        this.label += 1;
        return this.getBinaryAssm(assm);
    };
    CodeWriter.prototype.popStack = function (dest) {
        var assm = "";
        assm += "@SP\nAM=M-1\n";
        assm += dest + "=M\n";
        return assm;
    };
    CodeWriter.prototype.writeUniaryArithmetic = function (command) {
        var assm = "";
        switch (command) {
            case "neg":
                assm = this.getNegAssm();
                break;
            case "not":
                assm = this.getNotAssm();
                break;
            default:
                assm = "TODO";
                break;
        }
        return assm;
    };
    CodeWriter.prototype.isUinaryCommand = function (command) {
        return UNIARY_COMMANDS.indexOf(command) !== NOT_FOUND;
    };
    CodeWriter.prototype.writeArithmetic = function (command) {
        var assm = "";
        if (this.isUinaryCommand(command)) {
            assm = this.writeUniaryArithmetic(command);
        }
        else {
            assm = this.writeBinaryArithmetic(command);
        }
        return assm;
    };
    CodeWriter.prototype.writePushPop = function (command, segment, index) {
        var assm = "";
        if (command == vm_commands_1.STACK_OPEARTIONS.C_PUSH) {
            assm = this.getPushAssm(segment, index);
        }
        else if (command == vm_commands_1.STACK_OPEARTIONS.C_POP) {
            assm = this.getPopAssm(segment, index);
        }
        return assm;
    };
    CodeWriter.prototype.getPushAssm = function (segment, index) {
        var assm = "";
        switch (segment) {
            case "constant":
                assm = this.getConstantPush(index);
                break;
            case "static":
                assm = this.getStaticPush(index);
                break;
            case "argument":
                assm = this.getBasePushAssm("ARG", index);
                break;
            case "local":
                assm = this.getBasePushAssm("LCL", index);
                break;
            case "this":
                assm = this.getBasePushAssm("THIS", index);
                break;
            case "that":
                assm = this.getBasePushAssm("THAT", index);
                break;
            case "temp":
                assm = this.getRelativePushAssm(TEMP, index);
                break;
            case "pointer":
                assm = this.getRelativePushAssm(POINTER, index);
                break;
            default:
                assm = "TODO";
        }
        return assm;
    };
    CodeWriter.prototype.getPopAssm = function (segment, index) {
        var assm = "";
        switch (segment) {
            case "static":
                assm = this.getStaticPop(index);
                break;
            case "argument":
                assm = this.getBasePopAssm("ARG", index);
                break;
            case "local":
                assm = this.getBasePopAssm("LCL", index);
                break;
            case "temp":
                assm = this.getPointerPopAssm(TEMP, index);
                break;
            case "pointer":
                assm = this.getPointerPopAssm(POINTER, index);
                break;
            default:
                assm = "TODO";
        }
        return assm;
    };
    CodeWriter.prototype.getRelativePushAssm = function (baseIndex, index) {
        var assm = "@" + baseIndex + "\n";
        assm += "D=A\n";
        assm += "@" + index + "\n";
        assm += "A=A+D\n";
        assm += "D=M\n";
        return assm + this.incSP();
    };
    CodeWriter.prototype.getPointerPopAssm = function (baseIndex, index) {
        var assm = "@SP\n";
        assm += "AM=M-1\n";
        assm += "D=M\n";
        assm += "@" + (baseIndex + index) + "\n";
        assm += "M=D\n";
        return assm;
    };
    CodeWriter.prototype.getBasePushAssm = function (type, index) {
        var assm = "@" + type + "\n";
        assm += "D=M\n";
        assm += "@" + index + "\n";
        assm += "A=A+D\n";
        assm += "D=M\n";
        return assm + this.incSP();
    };
    CodeWriter.prototype.getBasePopAssm = function (type, index) {
        var assm = "@" + type + "\n";
        assm += "AD=M\n";
        assm += "@" + index + "\n";
        assm += "AD=A+D\n";
        assm += this.saveAddress();
        assm += this.popStack("D");
        assm += this.restoreAddress();
        assm += "M=D\n";
        return assm;
    };
    CodeWriter.prototype.saveData = function (src) {
        var assm = "";
        assm += "@R14\n";
        assm += "M=" + src + "\n";
        return assm;
    };
    CodeWriter.prototype.restoreData = function (dest) {
        return "@R14\n" + dest + "=M\n";
    };
    CodeWriter.prototype.saveAddress = function () {
        var assm = "";
        assm += "@R13\n";
        assm += "M=D\n";
        return assm;
    };
    CodeWriter.prototype.restoreAddress = function () {
        return "@R13\nA=M\n";
    };
    CodeWriter.prototype.getStaticPop = function (index) {
        var assm = this.popStack("D");
        assm += "@" + this.fileName + "." + index + "\n";
        assm += "M=D\n";
        return assm;
    };
    CodeWriter.prototype.getStaticPush = function (index) {
        var assm = "@" + this.fileName + "." + index + "\nD=M\n";
        return assm + this.incSP();
    };
    CodeWriter.prototype.getConstantPush = function (constant) {
        var assembly = "@" + constant + "\nD=A\n";
        return assembly + this.incSP();
    };
    CodeWriter.prototype.incSP = function () {
        var assm = "@SP\n";
        assm += "AM=M+1\n";
        assm += "A=A-1\n";
        assm += "M=D\n";
        return assm;
    };
    CodeWriter.prototype.writeInit = function () {
        var assm = "@256\nD=A\n@SP\nM=D\n";
        assm += this.writeCall("Sys.init", 0);
        return assm;
    };
    CodeWriter.prototype.writeLabel = function (label) {
        return "(" + label + ")\n";
    };
    CodeWriter.prototype.writeGoto = function (label) {
        return "@" + label + "\n0;JMP\n\n";
    };
    CodeWriter.prototype.writeIf = function (label, wasPrevCommandLogical) {
        var assm = this.popStack("D");
        assm += "@" + label + "\nD;JNE\n";
        return assm;
    };
    CodeWriter.prototype.writeCall = function (functionName, numArgs) {
        var comment = "\n// CALL BEGIN\n";
        var commentEnd = "// CALL END\n\n";
        var assm = "@" + RETURN_ADDRESS + "_" + this.returnIndex + "\n";
        assm += "D=A\n";
        assm += this.incSP();
        assm += this.pushSegmentBaseIndex("LCL");
        assm += this.pushSegmentBaseIndex("ARG");
        assm += this.pushSegmentBaseIndex("THIS");
        assm += this.pushSegmentBaseIndex("THAT");
        assm += this.setArgForTheCalledFunction(numArgs);
        assm += this.setLocalForTheCalledFunction();
        assm += this.writeGoto(functionName);
        assm += "(" + RETURN_ADDRESS + "_" + this.returnIndex + ")\n";
        this.returnIndex += 1;
        return comment + assm + commentEnd;
    };
    CodeWriter.prototype.writeReturn = function () {
        var comment = "\n// RETURN BEGIN\n";
        var commentEnd = "// RETURN END\n\n";
        var assm = this.setFrame();
        assm += this.dereferenceFrame(5);
        assm += "@" + RET + "\n";
        assm += "M=D\n";
        assm += this.popStack("D");
        assm += "@ARG\nA=M\nM=D\n";
        assm += this.setStackPointerToArg(1);
        assm += this.setThatInReturn();
        assm += this.setThisInReturn();
        assm += this.setArgInReturn();
        assm += this.setLocalInReturn();
        assm += this.gotoInReturn();
        return comment + assm + commentEnd;
    };
    CodeWriter.prototype.setFrame = function () {
        var assm = "@LCL\n";
        assm += "D=M\n";
        assm += "@" + FRAME + "\n";
        assm += "M=D\n";
        return assm;
    };
    CodeWriter.prototype.dereferenceFrame = function (index) {
        var assm = "@" + index + "\n";
        assm += "D=A\n";
        assm += "@" + FRAME + "\n";
        assm += "A=M-D\n";
        assm += "D=M\n";
        return assm;
    };
    CodeWriter.prototype.setStackPointerToArg = function (index) {
        var assm = "@ARG\n";
        assm += "D=M\n";
        assm += "@" + index + "\n";
        assm += "D=A+D\n";
        assm += "@SP\n";
        assm += "M=D\n";
        return assm;
    };
    CodeWriter.prototype.setThatInReturn = function () {
        var assm = this.dereferenceFrame(1);
        assm += "@THAT\nM=D\n";
        return assm;
    };
    CodeWriter.prototype.setThisInReturn = function () {
        var assm = this.dereferenceFrame(2);
        assm += "@THIS\nM=D\n";
        return assm;
    };
    CodeWriter.prototype.setArgInReturn = function () {
        var assm = this.dereferenceFrame(3);
        assm += "@ARG\nM=D\n";
        return assm;
    };
    CodeWriter.prototype.setLocalInReturn = function () {
        var assm = this.dereferenceFrame(4);
        assm += "@LCL\nM=D\n";
        return assm;
    };
    CodeWriter.prototype.gotoInReturn = function () {
        var assm = "";
        assm += "@" + RET + "\n";
        assm += "A=M\n";
        assm += "0;JMP\n";
        return assm;
    };
    CodeWriter.prototype.pushSegmentBaseIndex = function (type) {
        var assm = "@" + type + "\n";
        assm += "D=M\n";
        assm += this.incSP();
        return assm;
    };
    CodeWriter.prototype.setArgForTheCalledFunction = function (numArgs) {
        var assm = "@SP\n";
        assm += "D=M\n";
        assm += "@" + numArgs + "\n";
        assm += "D=D-A\n";
        assm += "@5\n";
        assm += "D=D-A\n";
        assm += "@ARG\n";
        assm += "M=D\n";
        return assm;
    };
    CodeWriter.prototype.setLocalForTheCalledFunction = function () {
        var assm = "@SP\n";
        assm += "D=M\n";
        assm += "@LCL\n";
        assm += "M=D\n";
        return assm;
    };
    CodeWriter.prototype.writeFunction = function (functionName, numLocals) {
        var assm = "\n(" + functionName + ")\n";
        for (var i = 0; i < numLocals; i++) {
            assm += this.getConstantPush(0);
        }
        return assm;
    };
    return CodeWriter;
}());
exports.default = CodeWriter;
