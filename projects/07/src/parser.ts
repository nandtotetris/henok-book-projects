import * as fs from "fs";
import { VM_COMMANDS } from "./vm_commands";

const NOT_FOUND = -1;
const FIRST_MATCH = 1;
const SECOND_MATCH = 2;

const REMOVE_COMMENT = /\/\/[^\n]+/g;
const PUSH_COMMAND = /push\s+([a-z]+)\s+(\d+)\b/;
const POP_COMMAND = /pop\s+([a-z]+)\s+(\d+)\b/;
const ARITHMETIC = ["add", "sub", "neg", "eq", "gt", "lt", "and", "or", "not"];

class Parser {
  private data: string;
  private currentIndex: number = -1;
  private currentCommand: string;
  private vm_commands: string[];

  private constructor() {}

  public static createAsync = async (filePath: string) => {
    let parser = new Parser();
    parser.data = await fs.readFileSync(filePath, "utf8");
    parser.removeComment();
    parser.preprocess();

    return parser;
  };

  getVMCommands = () => this.vm_commands;

  preprocess() {
    const vm_commands = this.data.split("\n").filter(instruction => {
      return instruction != "";
    });

    this.vm_commands = this.trimCommands(vm_commands);
  }

  trimCommands(vmCommands: string[]) {
    let sanitizedCommands = vmCommands.map(vmCommand => vmCommand.trim());
    return sanitizedCommands;
  }

  removeComment() {
    this.data = this.data.replace(REMOVE_COMMENT, "").trim();
  }

  hasMoreCommands(): boolean {
    return this.currentIndex < this.vm_commands.length;
  }

  advance() {
    if (this.hasMoreCommands()) {
      this.currentIndex += 1;
      this.currentCommand = this.vm_commands[this.currentIndex];
    }
  }

  getCurrentCommand = () => this.currentCommand;

  commandType(): VM_COMMANDS {
    let type: VM_COMMANDS;
    if (PUSH_COMMAND.test(this.currentCommand)) {
      type = VM_COMMANDS.C_PUSH;
    } else if (POP_COMMAND.test(this.currentCommand)) {
      type = VM_COMMANDS.C_POP;
    } else if (this.isCommandArithmetic(this.currentCommand)) {
      type = VM_COMMANDS.C_ARITHMETIC;
    }

    return type;
  }

  isCommandArithmetic(vmCommand: string) {
    return ARITHMETIC.indexOf(vmCommand) !== NOT_FOUND;
  }

  arg1(): string {
    let firstArgument: string;
    switch (this.commandType()) {
      case VM_COMMANDS.C_ARITHMETIC:
        firstArgument = this.currentCommand;
        break;
      case VM_COMMANDS.C_POP:
        firstArgument = POP_COMMAND.exec(this.currentCommand)[FIRST_MATCH];
        break;
      case VM_COMMANDS.C_PUSH:
        firstArgument = PUSH_COMMAND.exec(this.currentCommand)[FIRST_MATCH];
        break;
    }

    return firstArgument;
  }

  arg2(): number {
    let secondArgument: number;
    switch (this.commandType()) {
      case VM_COMMANDS.C_POP:
        secondArgument = parseInt(
          POP_COMMAND.exec(this.currentCommand)[SECOND_MATCH]
        );
        break;
      case VM_COMMANDS.C_PUSH:
        secondArgument = parseInt(
          PUSH_COMMAND.exec(this.currentCommand)[SECOND_MATCH]
        );
        break;
    }

    return secondArgument;
  }
}

export default Parser;
