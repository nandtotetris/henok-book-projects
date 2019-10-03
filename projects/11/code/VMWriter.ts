export enum SEGMENTS {
  ARG = 1,
  LOCAL,
  STATIC,
  THIS,
  THAT,
  POINTER,
  TEMP,
  CONSTANT
}

export enum VM_COMMANDS {
  ADD,
  SUB,
  NEG,
  EQ,
  GT,
  LT,
  AND,
  OR,
  NOT
}

class VMWritter {
  private data: string = "";

  constructor(outputFile: string) {}

  getData() {
    return this.data;
  }

  getSegment(segment: SEGMENTS) {
    if (segment === SEGMENTS.ARG) return "argument";
    return SEGMENTS[segment].toLowerCase();
  }

  getCommand(cmd: VM_COMMANDS) {
    return VM_COMMANDS[cmd].toLowerCase();
  }

  writePush(segment: SEGMENTS, index: number) {
    this.data += `push ${this.getSegment(segment)} ${index}\n`;
  }

  writePop(segment: SEGMENTS, index: number) {
    this.data += `pop ${this.getSegment(segment)} ${index}\n`;
  }

  writeArithmetic(command: VM_COMMANDS) {
    this.data += this.getCommand(command) + "\n";
  }

  writeLabel(label: string) {
    this.data += `label ${label}\n`;
  }

  writeGoto(label: string) {
    this.data += `goto ${label}\n`;
  }

  writeIf(label: string) {
    this.data += `if-goto ${label}\n`;
  }

  writeCall(name: string, nArgs: number) {
    this.data += `call ${name} ${nArgs}\n`;
  }

  writeFunction(name: string, nLocals: number) {
    this.data += `function ${name} ${nLocals}\n`;
  }

  writeCommand(command: string) {
    this.data += `${command}\n`;
  }

  writeReturn() {
    this.data += "return\n";
  }

  close() {}
}

export default VMWritter;
