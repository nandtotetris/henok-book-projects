import * as fs from "fs";
import { VM_COMMANDS } from "./vm_commands";

const NOT_FOUND = -1;
const FIRST_MATCH = 1;
const SECOND_MATCH = 2;

const EMPTY_LINE = /\s*/;
const REMOVE_COMMENT = /\/\/\s*[^\n]+/g;
const PUSH_COMMAND = /^push\s+([a-z]+)\s+(\d+)\b/;
const POP_COMMAND = /^pop\s+([a-z]+)\s+(\d+)\b/;
const LABEL_COMMAND = /^label\s+([a-zA-Z][a-zA-Z_\.\d]+)\b/;
const GOTO_COMMAND = /^goto\s+([a-zA-Z][a-zA-Z_\.\d]+)\b/;
const IF_COMMAND = /^if-goto\s+([a-zA-Z][a-zA-Z_\.\d]+)\b/;
const FUNCTION_COMMAND = /^function\s+([a-zA-Z][a-zA-Z_\.\d]+)\s+(\d+)\b/;
const RETURN_COMMAND = /^return/;
const CALL_COMMAND = /^call\s+([a-zA-Z][a-zA-Z_\.\d]+)\s+(\d+)\b/;
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

  wasPrevLogicalCommand() {
    const prevIndex = this.currentIndex - 1;
    return (
      ["eq", "lt", "gt"].indexOf(this.vm_commands[prevIndex]) !== NOT_FOUND
    );
  }

  getVMCommands = () => this.vm_commands;

  preprocess() {
    const splitCommands = this.data.split("\n");

    const vm_commands = splitCommands.filter(instruction => {
      return instruction.length > 1;
    });

    this.vm_commands = this.trimCommands(vm_commands);
  }

  trimCommands(vmCommands: string[]) {
    let sanitizedCommands = vmCommands.map(vmCommand => {
      return vmCommand.trim();
    });
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
    } else if (LABEL_COMMAND.test(this.currentCommand)) {
      type = VM_COMMANDS.C_LABEL;
    } else if (GOTO_COMMAND.test(this.currentCommand)) {
      type = VM_COMMANDS.C_GOTO;
    } else if (IF_COMMAND.test(this.currentCommand)) {
      type = VM_COMMANDS.C_IF;
    } else if (FUNCTION_COMMAND.test(this.currentCommand)) {
      type = VM_COMMANDS.C_FUNCTION;
    } else if (CALL_COMMAND.test(this.currentCommand)) {
      type = VM_COMMANDS.C_CALL;
    } else if (RETURN_COMMAND.test(this.currentCommand)) {
      type = VM_COMMANDS.C_RETURN;
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
      case VM_COMMANDS.C_LABEL:
        firstArgument = LABEL_COMMAND.exec(this.currentCommand)[FIRST_MATCH];
        break;
      case VM_COMMANDS.C_GOTO:
        firstArgument = GOTO_COMMAND.exec(this.currentCommand)[FIRST_MATCH];
        break;
      case VM_COMMANDS.C_IF:
        firstArgument = IF_COMMAND.exec(this.currentCommand)[FIRST_MATCH];
        break;
      case VM_COMMANDS.C_FUNCTION:
        firstArgument = FUNCTION_COMMAND.exec(this.currentCommand)[FIRST_MATCH];
        break;
      case VM_COMMANDS.C_CALL:
        firstArgument = CALL_COMMAND.exec(this.currentCommand)[FIRST_MATCH];
        break;
      default:
        firstArgument = "TODO";
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
      case VM_COMMANDS.C_FUNCTION:
        secondArgument = parseInt(
          FUNCTION_COMMAND.exec(this.currentCommand)[SECOND_MATCH]
        );
        break;
      case VM_COMMANDS.C_CALL:
        secondArgument = parseInt(
          CALL_COMMAND.exec(this.currentCommand)[SECOND_MATCH]
        );
        break;
    }

    return secondArgument;
  }
}

export default Parser;
