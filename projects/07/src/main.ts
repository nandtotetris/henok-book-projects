import * as fs from "fs";

import Parser from "./parser";
import CodeWriter from "./code_writer";
import { VM_COMMANDS, STACK_OPEARTIONS } from "./vm_commands";

const FOLDER_NAME = /\.*\/(\w+)/;
const ASSM_FILE_NAME = "main.asm";
const FILE_NAME_REGEX = /\.*\/*([a-zA-Z]+\w+\.vm)\b/;
const VM_FILE_REGEX = /(\w+)\.vm\b/;
const FIRST_MATCH = 1;

class VMTranslator {
  private parser: Parser;
  private codeWriter: CodeWriter;

  private constructor() {}

  public getParser = () => this.parser;
  public getCodeWriter = () => this.codeWriter;

  public save = async (path: string) => {
    let finalAssm: string = "";
    let outPath: string = "";
    const isPathDir = fs.existsSync(path) && fs.lstatSync(path).isDirectory();
    if (isPathDir) {
      const folderName = this.getFolderName(path);
      outPath = `${path}/${folderName}.asm`;
      const files = await this.getFilesInDirectory(path);
      const vmFiles = this.filterVMFiles(files);
      if (vmFiles.length > 1) {
        finalAssm += this.codeWriter.writeInit();
      }
      let parsersForEachVmFile: Parser[] = [];
      for (let i = 0; i < vmFiles.length; i++) {
        const vmFile = vmFiles[i];
        const parser = await Parser.createAsync(`${path}/${vmFile}`);
        parsersForEachVmFile.push(parser);
      }

      for (let i = 0; i < parsersForEachVmFile.length; i++) {
        const vmFile = vmFiles[i];
        const parser = parsersForEachVmFile[i];
        const vmFileAssm = this.getAssemblyCode(vmFile, parser);
        finalAssm += vmFileAssm;
        finalAssm += "\n";
      }
    } else {
      const fileName = this.getFileNameInRelativePath(path);
      const fileNameWithoutExtenstion = this.getFileNameWithoutExtenstion(
        fileName
      );
      outPath = `../${fileNameWithoutExtenstion}.asm`;
      const parser = await Parser.createAsync(path);
      finalAssm = this.getAssemblyCode(fileName, parser);
    }

    fs.writeFileSync(`${outPath}`, finalAssm);
  };

  getFileNameWithoutExtenstion(path: string) {
    return path.split(".")[0];
  }

  async getFilesInDirectory(path: string): Promise<Array<string>> {
    const files = await fs.readdirSync(path);
    return files;
  }

  filterVMFiles(files: Array<string>): Array<string> {
    return files.filter(file => VM_FILE_REGEX.test(file));
  }

  public getAssemblyCode = (filePath: string, parser: Parser) => {
    let final_assm: string = "";
    parser.advance();
    this.codeWriter.setFileName(this.getFileName(filePath));
    while (parser.hasMoreCommands()) {
      switch (parser.commandType()) {
        case VM_COMMANDS.C_PUSH:
          final_assm += this.codeWriter.writePushPop(
            STACK_OPEARTIONS.C_PUSH,
            parser.arg1(),
            parser.arg2()
          );
          break;
        case VM_COMMANDS.C_POP:
          final_assm += this.codeWriter.writePushPop(
            STACK_OPEARTIONS.C_POP,
            parser.arg1(),
            parser.arg2()
          );
          break;
        case VM_COMMANDS.C_ARITHMETIC:
          final_assm += this.codeWriter.writeArithmetic(parser.arg1());
          break;
        case VM_COMMANDS.C_LABEL:
          final_assm += this.codeWriter.writeLabel(parser.arg1());
          break;
        case VM_COMMANDS.C_IF:
          final_assm += this.codeWriter.writeIf(
            parser.arg1(),
            parser.wasPrevLogicalCommand()
          );
          break;
        case VM_COMMANDS.C_GOTO:
          final_assm += this.codeWriter.writeGoto(parser.arg1());
          break;
        case VM_COMMANDS.C_FUNCTION:
          final_assm += this.codeWriter.writeFunction(
            parser.arg1(),
            parser.arg2()
          );
          break;
        case VM_COMMANDS.C_CALL:
          final_assm += this.codeWriter.writeCall(parser.arg1(), parser.arg2());
          break;
        case VM_COMMANDS.C_RETURN:
          final_assm += this.codeWriter.writeReturn();
          break;
        default:
          final_assm += "TODOO";
      }
      parser.advance();
    }

    return final_assm.trim();
  };

  getFileNameInRelativePath(filePath: string): string {
    return FILE_NAME_REGEX.exec(filePath)[FIRST_MATCH];
  }

  getFolderName(filePath: string) {
    return FOLDER_NAME.exec(filePath)[FIRST_MATCH];
  }

  getFileName(filePath: string): string {
    return VM_FILE_REGEX.exec(filePath)[FIRST_MATCH];
  }

  public static createTranslator = () => {
    let translator = new VMTranslator();
    translator.codeWriter = new CodeWriter();

    return translator;
  };
}

const translator = VMTranslator.createTranslator();
translator.save("../NestedCall");
