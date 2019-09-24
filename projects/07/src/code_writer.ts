import * as fs from "fs";
import { STACK_OPEARTIONS } from "./vm_commands";

const UNIARY_COMMANDS = ["neg", "not"];
const NOT_FOUND = -1;
const TEMP = 5;
const FRAME = "R13";
const RET = "R14";
const POINTER = 3;
const RETURN_ADDRESS = "RETURN_ADDRESS";

class CodeWriter {
  private fileName: string;
  private label: number = 1;
  private returnIndex: number = 1;
  constructor() {}

  setFileName(fileName: string) {
    this.fileName = fileName;
  }

  writeBinaryArithmetic(command: string): string {
    let binaryAssm: string = "";
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
  }

  getBinaryAssm(dependentAssm: string) {
    let assm: string = this.popStack("D");
    assm += this.popStack("A");
    assm += dependentAssm;
    assm += this.incSP();

    return assm;
  }

  getUniaryAssm(dependentAssm: string) {
    let assm: string = this.popStack("D");
    assm += dependentAssm;
    assm += this.incSP();

    return assm;
  }

  getNegAssm() {
    return this.getUniaryAssm("D=-D\n");
  }

  getNotAssm() {
    return this.getUniaryAssm("D=!D\n");
  }

  getSubAssm(operation: string): string {
    return this.getArthimeticAssm(operation) + this.getNegAssm();
  }

  getArthimeticAssm(operation: string) {
    return this.getBinaryAssm("D=D" + operation + "A\n");
  }

  getLogicalAssm(jump: string) {
    let assm: string =
      "D=D-A\n@EQUAL_" +
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
  }

  popStack(dest: string): string {
    let assm: string = "";
    assm += "@SP\nAM=M-1\n";
    assm += `${dest}=M\n`;

    return assm;
  }

  writeUniaryArithmetic(command: string): string {
    let assm: string = "";
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
  }

  isUinaryCommand(command: string) {
    return UNIARY_COMMANDS.indexOf(command) !== NOT_FOUND;
  }

  writeArithmetic(command: string): string {
    let assm: string = "";
    if (this.isUinaryCommand(command)) {
      assm = this.writeUniaryArithmetic(command);
    } else {
      assm = this.writeBinaryArithmetic(command);
    }

    return assm;
  }

  writePushPop(
    command: STACK_OPEARTIONS,
    segment: string,
    index: number
  ): string {
    let assm: string = "";
    if (command == STACK_OPEARTIONS.C_PUSH) {
      assm = this.getPushAssm(segment, index);
    } else if (command == STACK_OPEARTIONS.C_POP) {
      assm = this.getPopAssm(segment, index);
    }

    return assm;
  }

  getPushAssm(segment: string, index: number) {
    let assm: string = "";
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
  }

  getPopAssm(segment: string, index: number) {
    let assm: string = "";
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
  }

  getRelativePushAssm(baseIndex: number, index: number) {
    let assm = "@" + baseIndex + "\n";
    assm += "D=A\n";
    assm += "@" + index + "\n";
    assm += "A=A+D\n";
    assm += "D=M\n";

    return assm + this.incSP();
  }

  getPointerPopAssm(baseIndex: number, index: number) {
    let assm: string = "@SP\n";
    assm += "AM=M-1\n";
    assm += "D=M\n";
    assm += `@${baseIndex + index}\n`;
    assm += "M=D\n";

    return assm;
  }

  getBasePushAssm(type: string, index: number) {
    let assm = "@" + type + "\n";
    assm += "D=M\n";
    assm += "@" + index + "\n";
    assm += "A=A+D\n";
    assm += "D=M\n";

    return assm + this.incSP();
  }

  getBasePopAssm(type: string, index: number) {
    let assm = "@" + type + "\n";
    assm += "AD=M\n";
    assm += "@" + index + "\n";
    assm += "AD=A+D\n";
    assm += this.saveAddress();
    assm += this.popStack("D");
    assm += this.restoreAddress();
    assm += "M=D\n";

    return assm;
  }

  saveData(src: string) {
    let assm: string = "";
    assm += "@R14\n";
    assm += `M=${src}\n`;

    return assm;
  }

  restoreData(dest: string) {
    return `@R14\n${dest}=M\n`;
  }

  saveAddress() {
    let assm: string = "";
    assm += "@R13\n";
    assm += "M=D\n";

    return assm;
  }

  restoreAddress() {
    return "@R13\nA=M\n";
  }

  getStaticPop(index: number) {
    let assm: string = this.popStack("D");
    assm += "@" + this.fileName + "." + index + "\n";
    assm += "M=D\n";

    return assm;
  }

  getStaticPush(index: number) {
    let assm = "@" + this.fileName + "." + index + "\nD=M\n";
    return assm + this.incSP();
  }

  getConstantPush(constant: number) {
    let assembly = "@" + constant + "\nD=A\n";
    return assembly + this.incSP();
  }

  incSP() {
    let assm: string = "@SP\n";
    assm += "AM=M+1\n";
    assm += "A=A-1\n";
    assm += "M=D\n";

    return assm;
  }

  writeInit() {
    let assm = "@256\nD=A\n@SP\nM=D\n";
    assm += this.writeCall("Sys.init", 0);

    return assm;
  }

  writeLabel(label: string) {
    return `(${label})\n`;
  }

  writeGoto(label: string) {
    return `@${label}\n0;JMP\n\n`;
  }

  writeIf(label: string, wasPrevCommandLogical: boolean) {
    let assm: string = this.popStack("D");
    assm += `@${label}\nD;JNE\n`;

    return assm;
  }

  writeCall(functionName: string, numArgs: number) {
    const comment = "\n// CALL BEGIN\n";
    const commentEnd = "// CALL END\n\n";
    let assm: string = `@${RETURN_ADDRESS}_${this.returnIndex}\n`;
    assm += "D=A\n";
    assm += this.incSP();
    assm += this.pushSegmentBaseIndex("LCL");
    assm += this.pushSegmentBaseIndex("ARG");
    assm += this.pushSegmentBaseIndex("THIS");
    assm += this.pushSegmentBaseIndex("THAT");
    assm += this.setArgForTheCalledFunction(numArgs);
    assm += this.setLocalForTheCalledFunction();
    assm += this.writeGoto(functionName);
    assm += `(${RETURN_ADDRESS}_${this.returnIndex})\n`;

    this.returnIndex += 1;

    return comment + assm + commentEnd;
  }

  writeReturn() {
    const comment = "\n// RETURN BEGIN\n";
    const commentEnd = "// RETURN END\n\n";
    let assm: string = this.setFrame();
    assm += this.dereferenceFrame(5);
    assm += `@${RET}\n`;
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
  }

  setFrame(): string {
    let assm: string = "@LCL\n";
    assm += "D=M\n";
    assm += `@${FRAME}\n`;
    assm += "M=D\n";

    return assm;
  }

  dereferenceFrame(index: number): string {
    let assm: string = `@${index}\n`;
    assm += "D=A\n";
    assm += `@${FRAME}\n`;
    assm += "A=M-D\n";
    assm += "D=M\n";

    return assm;
  }

  setStackPointerToArg(index: number): string {
    let assm: string = "@ARG\n";
    assm += "D=M\n";
    assm += `@${index}\n`;
    assm += "D=A+D\n";
    assm += "@SP\n";
    assm += "M=D\n";

    return assm;
  }

  setThatInReturn(): string {
    let assm: string = this.dereferenceFrame(1);
    assm += "@THAT\nM=D\n";

    return assm;
  }

  setThisInReturn(): string {
    let assm: string = this.dereferenceFrame(2);
    assm += "@THIS\nM=D\n";

    return assm;
  }

  setArgInReturn(): string {
    let assm: string = this.dereferenceFrame(3);
    assm += "@ARG\nM=D\n";

    return assm;
  }

  setLocalInReturn(): string {
    let assm: string = this.dereferenceFrame(4);
    assm += "@LCL\nM=D\n";

    return assm;
  }

  gotoInReturn(): string {
    let assm: string = "";
    assm += `@${RET}\n`;
    assm += "A=M\n";
    assm += "0;JMP\n";

    return assm;
  }

  pushSegmentBaseIndex(type: string) {
    let assm: string = `@${type}\n`;
    assm += "D=M\n";
    assm += this.incSP();

    return assm;
  }

  setArgForTheCalledFunction(numArgs: number) {
    let assm: string = "@SP\n";
    assm += "D=M\n";
    assm += `@${numArgs}\n`;
    assm += "D=D-A\n";
    assm += "@5\n";
    assm += "D=D-A\n";
    assm += "@ARG\n";
    assm += "M=D\n";

    return assm;
  }

  setLocalForTheCalledFunction() {
    let assm: string = "@SP\n";
    assm += "D=M\n";
    assm += "@LCL\n";
    assm += "M=D\n";

    return assm;
  }

  writeFunction(functionName: string, numLocals: number) {
    let assm: string = `\n(${functionName})\n`;
    for (let i = 0; i < numLocals; i++) {
      assm += this.getConstantPush(0);
    }

    return assm;
  }
}

export default CodeWriter;
