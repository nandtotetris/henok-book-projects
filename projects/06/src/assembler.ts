import * as fs from "fs";
import Parser from "./parser";

class Assembler {
  private parser: Parser;
  private binaryCode: string = "";

  private constructor() {}

  public static createAsync = async (filePath: string) => {
    let obj = new Assembler();

    obj.parser = await Parser.createAsync(filePath);

    return obj;
  };

  getAMachineCode() {
    const symbol = this.parser.symbol();
    const binarySymbol = this.pad16bit(Number(symbol).toString(2));
    return "0" + binarySymbol;
  }

  getCMachineCode(): string {
    let code = "111";
    code += this.parser.comp();
    code += this.parser.dest();
    code += this.parser.jump();
    return code;
  }

  pad16bit(binary: string) {
    const len = binary.length;
    if (len <= 15) {
      const diff = 15 - len;
      binary = this.getZeros(diff) + binary;
    }

    return binary;
  }

  getZeros(num: number) {
    let result = "";
    for (let i = 1; i <= num; i++) {
      result += "0";
    }
    return result;
  }

  save = (path: string) => {
    fs.writeFileSync(path, this.getMachineCode());
  };

  getMachineCode(): string {
    this.parser.advance();
    while (this.parser.hasMoreCommands()) {
      switch (this.parser.commandType()) {
        case 1:
          this.binaryCode += this.getAMachineCode();
          this.binaryCode += "\n";
          break;
        case 2:
          this.binaryCode += this.getCMachineCode();
          this.binaryCode += "\n";
          break;
      }
      this.parser.advance();
    }

    return this.binaryCode.trim();
  }

  getParser = () => this.parser;
}

let assembler = Assembler.createAsync("../prog.asm");
assembler.then(assembler => {
  assembler.save("../prog.hack");
});
