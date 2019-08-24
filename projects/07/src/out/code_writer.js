"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vm_commands_1 = require("./vm_commands");
var UNIARY_COMMANDS = ["neg", "not"];
var NOT_FOUND = -1;
var CodeWriter = /** @class */ (function () {
    function CodeWriter() {
        this.label = 1;
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
        var assm = this.decSP();
        assm += this.getTop("D");
        assm += this.decSP();
        assm += this.getTop("A");
        assm += dependentAssm;
        assm += this.incSP();
        return assm;
    };
    CodeWriter.prototype.getUniaryAssm = function (dependentAssm) {
        var assm = this.decSP();
        assm += this.getTop("D");
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
    CodeWriter.prototype.getTop = function (dest) {
        return "@SP\nA=M\n" + dest + "=M\n";
    };
    CodeWriter.prototype.decSP = function () {
        return "@SP\nM=M-1\n";
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
                assm = this.getTempPushAssm(5, index);
                break;
            case "pointer":
                assm = this.getTempPushAssm(3, index);
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
            case "this":
                assm = this.getBasePopAssm("THIS", index);
                break;
            case "that":
                assm = this.getBasePopAssm("THAT", index);
                break;
            case "temp":
                assm = this.getTempPopAssm(5, index);
                break;
            case "pointer":
                assm = this.getTempPopAssm(3, index);
                break;
            default:
                assm = "TODO";
        }
        return assm;
    };
    CodeWriter.prototype.getTempPushAssm = function (baseIndex, index) {
        var assm = "@" + baseIndex + "\n";
        assm += "D=A\n";
        assm += "@" + index + "\n";
        assm += "A=A+D\n";
        assm += "D=M\n";
        return assm + this.incSP();
    };
    CodeWriter.prototype.getTempPopAssm = function (baseIndex, index) {
        var assm = "@" + baseIndex + "\n";
        assm += "D=A\n";
        assm += "@" + index + "\n";
        assm += "A=A+D\n";
        assm += this.saveAddress();
        assm += this.decSP();
        assm += this.getTop("D");
        assm += this.restoreAddress();
        assm += "M=D\n";
        return assm;
    };
    CodeWriter.prototype.getBasePushAssm = function (type, index) {
        var assm = "@" + type + "\n";
        assm += "A=M\n";
        assm += "D=A\n";
        assm += "@" + index + "\n";
        assm += "A=A+D\n";
        assm += "D=M\n";
        return assm + this.incSP();
    };
    CodeWriter.prototype.getBasePopAssm = function (type, index) {
        var assm = "@" + type + "\n";
        assm += "A=M\n";
        assm += "D=A\n";
        assm += "@" + index + "\n";
        assm += "A=A+D\n";
        assm += this.saveAddress();
        assm += this.decSP();
        assm += this.getTop("D");
        assm += this.restoreAddress();
        assm += "M=D\n";
        return assm;
    };
    CodeWriter.prototype.saveAddress = function () {
        var assm = "";
        assm += "D=A\n";
        assm += "@R13\n";
        assm += "M=D\n";
        return assm;
    };
    CodeWriter.prototype.restoreAddress = function () {
        return "@R13\nA=M\n";
    };
    CodeWriter.prototype.getStaticPop = function (index) {
        var assm = this.decSP();
        assm += this.getTop("D");
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
        var saveToStack = "@SP\nA=M\nM=D\n";
        var incStackPointer = "@SP\nM=M+1\n";
        return saveToStack + incStackPointer;
    };
    return CodeWriter;
}());
exports.default = CodeWriter;
