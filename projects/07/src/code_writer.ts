import * as fs from "fs";
import { STACK_OPEARTIONS } from "./vm_commands";

const UNIARY_COMMANDS = ["neg", "not"];
const NOT_FOUND = -1;

class CodeWriter {
  private fileName: string;
  private label: number = 1;
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
    let assm: string = this.decSP();
    assm += this.getTop("D");
    assm += this.decSP();
    assm += this.getTop("A");
    assm += dependentAssm;
    assm += this.incSP();

    return assm;
  }

  getUniaryAssm(dependentAssm: string) {
    let assm: string = this.decSP();
    assm += this.getTop("D");
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

  getTop(dest: string): string {
    return "@SP\nA=M\n" + dest + "=M\n";
  }

  decSP() {
    return "@SP\nM=M-1\n";
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
        assm = this.getTempPushAssm(5, index);
        break;
      case "pointer":
        assm = this.getTempPushAssm(3, index);
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
  }

  getTempPushAssm(baseIndex: number, index: number) {
    let assm = "@" + baseIndex + "\n";
    assm += "D=A\n";
    assm += "@" + index + "\n";
    assm += "A=A+D\n";
    assm += "D=M\n";

    return assm + this.incSP();
  }

  getTempPopAssm(baseIndex: number, index: number) {
    let assm = "@" + baseIndex + "\n";
    assm += "D=A\n";
    assm += "@" + index + "\n";
    assm += "A=A+D\n";
    assm += this.saveAddress();
    assm += this.decSP();
    assm += this.getTop("D");
    assm += this.restoreAddress();
    assm += "M=D\n";

    return assm;
  }

  getBasePushAssm(type: string, index: number) {
    let assm = "@" + type + "\n";
    assm += "A=M\n";
    assm += "D=A\n";
    assm += "@" + index + "\n";
    assm += "A=A+D\n";
    assm += "D=M\n";

    return assm + this.incSP();
  }

  getBasePopAssm(type: string, index: number) {
    let assm = "@" + type + "\n";
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
  }

  saveAddress() {
    let assm: string = "";
    assm += "D=A\n";
    assm += "@R13\n";
    assm += "M=D\n";

    return assm;
  }

  restoreAddress() {
    return "@R13\nA=M\n";
  }

  getStaticPop(index: number) {
    let assm: string = this.decSP();
    assm += this.getTop("D");
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
    const saveToStack = "@SP\nA=M\nM=D\n";
    const incStackPointer = "@SP\nM=M+1\n";
    return saveToStack + incStackPointer;
  }
}

export default CodeWriter;
