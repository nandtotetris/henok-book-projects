import * as fs from "fs";
import CompilationEngine from "./compilationEngine";

const JACK_FILE_REGEX = /(\w+)\.jack\b/;

class Analayzer {
  private inputPath: string;

  constructor(path: string) {
    this.inputPath = path;
  }

  write(path: string, engine: CompilationEngine) {
    const newPath = this.getFileNameWithoutExtenstion(path);
    engine.compileClass();
    const xml = engine.getData();
    fs.writeFileSync(`${newPath}.xml`, xml);
  }

  hasDirForwardSlash = (path: string): boolean => {
    return path[path.length - 1] == "/";
  };

  save = async () => {
    const isPathExist = fs.existsSync(this.inputPath);
    const isPathDir = isPathExist && fs.lstatSync(this.inputPath).isDirectory();

    if (!isPathExist) {
      throw new Error("given path doesn't exist");
    }

    if (isPathDir) {
      const hasForwardSlash = this.hasDirForwardSlash(this.inputPath);
      const files = await this.getFilesInDirectory(this.inputPath);
      const jackFiles = this.filterJackFiles(files);
      jackFiles.forEach(jackFile => {
        const filePath = `${this.inputPath}${
          hasForwardSlash ? "" : "/"
        }${jackFile}`;
        this.write(filePath, new CompilationEngine(filePath));
      });
    } else {
      console.log(this.isJackFile(this.inputPath));
      if (!this.isJackFile(this.inputPath)) {
        throw new Error(".jack file expected");
      }

      this.write(this.inputPath, new CompilationEngine(this.inputPath));
    }

    console.log("file saved successfully");
  };

  getFileNameWithoutExtenstion(path: string) {
    const lastDotIndex = path.lastIndexOf(".");
    return path.slice(0, lastDotIndex);
  }

  async getFilesInDirectory(path: string): Promise<Array<string>> {
    const files = await fs.readdirSync(path);
    return files;
  }

  isJackFile = (file: string): boolean => {
    return JACK_FILE_REGEX.test(file) == true;
  };

  filterJackFiles(files: Array<string>): Array<string> {
    return files.filter(file => this.isJackFile(file));
  }

  // getXML(): string {
  //   let xml: string = "<tokens>\n";
  //   this.tokenizer.advance();
  //   while (this.tokenizer.hasMoreTokens()) {
  //     switch (this.tokenizer.tokenType()) {
  //       case TOKEN_TYPES.KEYWORD:
  //         xml += `<keyword> ${this.tokenizer.keyword()} </keyword>\n`;
  //         break;
  //       case TOKEN_TYPES.IDENTIFIER:
  //         xml += `<identifier> ${this.tokenizer.identifier()} </identifier>\n`;
  //         break;
  //       case TOKEN_TYPES.INT_CONST:
  //         xml += `<integerConstant> ${this.tokenizer.intVal()} </integerConstant>\n`;
  //         break;
  //       case TOKEN_TYPES.STRING_CONST:
  //         xml += `<stringConstant> ${this.tokenizer.stringVal()} </stringConstant>\n`;
  //         break;
  //       case TOKEN_TYPES.SYMBOL:
  //         let sym: string = "";
  //         const symbol = this.tokenizer.symbol() + "";
  //         if (this.tokenizer.symbol() == ">") {
  //           sym = "&gt;";
  //         } else if (symbol == "<") {
  //           sym = "&lt;";
  //         } else if (symbol == '"') {
  //           sym = "&quot;";
  //         } else if (symbol == "&") {
  //           sym = "&amp;";
  //         } else {
  //           sym = symbol;
  //         }
  //         xml += `<symbol> ${sym} </symbol>\n`;
  //         break;
  //     }
  //     this.tokenizer.advance();
  //   }
  //   xml += "</tokens>";

  //   return xml;
  // }
}

const analyzer = new Analayzer("../Square/");
analyzer.save();
