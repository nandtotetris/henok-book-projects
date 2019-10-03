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
    const xml = engine.getVMData();
    fs.writeFileSync(`${newPath}.vm`, xml);
  }

  hasDirForwardSlash = (path: string): boolean => {
    return path[path.length - 1] == "/";
  };

  save = async () => {
    const doesPathExist = fs.existsSync(this.inputPath);
    const isDirectory = fs.lstatSync(this.inputPath).isDirectory();
    const isPathDir = doesPathExist && isDirectory;

    if (!doesPathExist) {
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
    return JACK_FILE_REGEX.test(file) === true;
  };

  filterJackFiles(files: Array<string>): Array<string> {
    return files.filter(file => this.isJackFile(file));
  }
}

const analyzer = new Analayzer("../Pong/");
analyzer.save();
