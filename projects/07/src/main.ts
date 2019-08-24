import * as fs from "fs";

import Parser from "./parser";
import CodeWriter from "./code_writer";
import { VM_COMMANDS, STACK_OPEARTIONS } from "./vm_commands";

const FILE_NAME_REGEX = /\.*\/*([a-zA-z_]+)\.\w+/;

class VMTranslator {
  private parser: Parser;
  private codeWriter: CodeWriter;

  private constructor() {}

  public getParser = () => this.parser;
  public getCodeWriter = () => this.codeWriter;

  public save = (path: string) => {
    fs.writeFileSync(path, this.getAssemblyCode(path));
  };

  public getAssemblyCode = (filePath: string) => {
    let final_assm: string = "";
    this.parser.advance();
    this.codeWriter.setFileName(this.getFileName(filePath));
    while (this.parser.hasMoreCommands()) {
      switch (this.parser.commandType()) {
        case VM_COMMANDS.C_PUSH:
          final_assm += this.codeWriter.writePushPop(
            STACK_OPEARTIONS.C_PUSH,
            this.parser.arg1(),
            this.parser.arg2()
          );
          break;
        case VM_COMMANDS.C_POP:
          final_assm += this.codeWriter.writePushPop(
            STACK_OPEARTIONS.C_POP,
            this.parser.arg1(),
            this.parser.arg2()
          );
          break;
        case VM_COMMANDS.C_ARITHMETIC:
          final_assm += this.codeWriter.writeArithmetic(this.parser.arg1());
          break;
        default:
          final_assm += "TODO";
          break;
      }
      this.parser.advance();
    }

    return final_assm.trim();
  };

  getFileName(filePath: string): string {
    return FILE_NAME_REGEX.exec(filePath)[1];
  }

  public static createAsync = async (filePath: string) => {
    let translator = new VMTranslator();
    translator.parser = await Parser.createAsync(filePath);
    translator.codeWriter = new CodeWriter();

    return translator;
  };
}

VMTranslator.createAsync("../prog.vm").then(translator => {
  translator.save("../prog.asm");
});
