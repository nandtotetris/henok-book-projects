import * as fs from "fs";
import Code from "./code";
import SymbolTable from "./symboltable";

enum COMMAND_TYPES {
  A_COMMAND = 1,
  C_COMMAND,
  L_COMMAND
}

enum FILEDS_COMPUTE {
  HAS_DESTINATION = 1,
  HAS_JUMP,
  HAS_BOTH_JUMP_AND_DESTINATION,
  COMPUTE_ONLY
}

const NOT_RESOLVED_VARIABLE = /^@[a-zA-Z_][_a-zA-Z\.\$\d]*\b/;
const VARIABLE = /^@[A-Za-z_\d][_A-Za-z\.\$\d]*\b/;
const LABEL = /\(\s*([A-Za-z_][_A-Za-z\.\$\d]*)\s*\)/;
const REMOVE_COMMENT = /\/\/[^\n]+/g;

class Parser {
  private data: string;
  private instructions: string[];
  private ROMInstructionIndex: number = 0;
  private RAMIndex: number = 16;
  private currentInstructionIndex: number = -1;
  private currentCommand: string;
  private code: Code;
  private symTable: SymbolTable;

  private constructor() {
    this.code = new Code();
    this.symTable = new SymbolTable();
  }

  public static createAsync = async (filePath: string) => {
    let obj = new Parser();
    obj.data = await fs.readFileSync(filePath, "utf8");

    obj.removeComment();
    obj.preprocess();
    obj.firstSymbolTablePass();
    obj.secondSymbolTablePass();

    return obj;
  };

  preprocess() {
    const instructions = this.data.split("\n").filter(instruction => {
      return instruction != "";
    });

    this.instructions = instructions;
  }

  removeComment() {
    this.data = this.data.replace(REMOVE_COMMENT, "").trim();
  }

  isInstrctionVariable(instruction: string): boolean {
    return VARIABLE.test(instruction);
  }

  isInstructionLabel(instruction: string): boolean {
    return LABEL.test(instruction);
  }

  firstSymbolTablePass() {
    for (let i = 0; i < this.instructions.length; i++) {
      this.instructions[i] = this.instructions[i].trim();
      const instruction = this.instructions[i];
      if (this.isInstructionLabel(instruction)) {
        const symbol = this.getLabelName(instruction);
        if (!this.symTable.contains(symbol)) {
          this.symTable.addEntry(symbol, this.ROMInstructionIndex);
        }
      } else {
        this.ROMInstructionIndex += 1;
      }
    }
  }

  getLabelName(instruction: string): string {
    return LABEL.exec(instruction)[1];
  }

  removeLabels() {
    this.instructions = this.instructions.filter(
      instruction => !LABEL.test(instruction)
    );
  }

  secondSymbolTablePass() {
    this.removeLabels();
    this.instructions = this.instructions.map(instruction => {
      let newInstruction = "";
      if (NOT_RESOLVED_VARIABLE.test(instruction)) {
        const symbol = instruction.slice(1);
        if (!this.symTable.contains(symbol)) {
          this.symTable.addEntry(symbol, this.RAMIndex);
          newInstruction = "@" + this.RAMIndex;
          this.RAMIndex += 1;
        } else {
          newInstruction = "@" + this.symTable.getAddress(symbol);
        }
      } else {
        newInstruction = instruction;
      }

      return newInstruction;
    });
  }

  hasInstructionX(x: string) {
    const command = this.currentCommand;
    const fields = command.split(x);
    return this.hasDestination(fields.length);
  }

  hasInstructionDestination() {
    return this.hasInstructionX("=");
  }

  hasInstructionJump() {
    return this.hasInstructionX(";");
  }

  getComputeFieldsType(): FILEDS_COMPUTE {
    let fields: FILEDS_COMPUTE;
    if (this.hasInstructionDestination() && this.hasInstructionJump()) {
      fields = FILEDS_COMPUTE.HAS_BOTH_JUMP_AND_DESTINATION;
    } else if (this.hasInstructionDestination()) {
      fields = FILEDS_COMPUTE.HAS_DESTINATION;
    } else if (this.hasInstructionJump()) {
      fields = FILEDS_COMPUTE.HAS_JUMP;
    } else {
      fields = FILEDS_COMPUTE.COMPUTE_ONLY;
    }

    return fields;
  }

  hasMoreCommands(): boolean {
    return this.currentInstructionIndex <= this.instructions.length - 1;
  }

  advance() {
    if (this.hasMoreCommands()) {
      this.currentInstructionIndex += 1;
      this.currentCommand = this.instructions[this.currentInstructionIndex];
    }
  }

  commandType(): COMMAND_TYPES {
    let type: COMMAND_TYPES;
    if (LABEL.test(this.currentCommand)) {
      type = COMMAND_TYPES.L_COMMAND;
    } else if (VARIABLE.test(this.currentCommand)) {
      type = COMMAND_TYPES.A_COMMAND;
    } else {
      type = COMMAND_TYPES.C_COMMAND;
    }

    return type;
  }

  symbol(): string {
    const currentCommandType = this.commandType();
    if (currentCommandType == COMMAND_TYPES.A_COMMAND) {
      return this.currentCommand.slice(1);
    }
  }

  dest(): string {
    const currentCommandType = this.commandType();
    let destionation: string;
    if (currentCommandType == COMMAND_TYPES.C_COMMAND) {
      let destMnemonic: string = "NULL";
      if (this.hasInstructionX("=")) {
        destMnemonic = this.currentCommand.split("=")[0].trim();
      }
      destionation = this.code.dest(destMnemonic);
    }

    return destionation;
  }

  comp(): string {
    const currentCommandType = this.commandType();
    let compute: string;
    if (currentCommandType == COMMAND_TYPES.C_COMMAND) {
      compute = this.getComputeField();
    }

    return this.code.comp(compute);
  }

  getComputeField(): string {
    let compute: string = "";
    const fields: FILEDS_COMPUTE = this.getComputeFieldsType();
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
  }

  jump(): string {
    const currentCommandType = this.commandType();
    let jump: string;
    if (currentCommandType == COMMAND_TYPES.C_COMMAND) {
      let jumpMnemonic: string = "NULL";
      if (this.hasInstructionX(";")) {
        jumpMnemonic = this.currentCommand.split(";")[1].trim();
      }
      jump = jumpMnemonic;
    }

    return this.code.jump(jump);
  }

  hasDestination(length: number) {
    return length != 1;
  }
}

export default Parser;
