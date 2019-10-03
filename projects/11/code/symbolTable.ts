export enum KINDS {
  STATIC = 1,
  FIELD,
  ARG,
  VAR
}

export enum ALL_KINDS {
  STATIC = 1,
  FIELD,
  ARG,
  VAR,
  NONE
}

const TYPE = 0;
const KIND = 1;
const INDEX = 2;

class SymbolTable {
  private methodSymTable: Object = {};
  private classSymTable: Object = {};

  constructor() {}

  startSubroutine() {
    this.methodSymTable = {};
  }

  log() {
    console.log(this.classSymTable);
    console.log(this.methodSymTable);
  }

  define(name: string, type: string, kind: KINDS) {
    if (kind === KINDS.FIELD || kind == KINDS.STATIC) {
      // class level variables
      this.classSymTable[name] = [type, kind, this.varCount(kind)];
    } else {
      this.methodSymTable[name] = [type, kind, this.varCount(kind)];
    }
  }

  varCount(kind: KINDS): number {
    let count: number = 0;
    if (kind === KINDS.FIELD || kind === KINDS.STATIC) {
      count = this.countFromClassSymTable(kind);
    } else if (kind === KINDS.ARG || kind === KINDS.VAR) {
      count = this.countFromMethodSymTable(kind);
    }
    return count;
  }

  doesKindExist(requiredKey: KINDS, kind: KINDS) {
    return requiredKey === kind;
  }

  countFromMethodSymTable(requiredKey: KINDS): number {
    let count: number = 0;
    Object.keys(this.methodSymTable).forEach(key => {
      if (this.doesKindExist(requiredKey, this.methodSymTable[key][KIND]))
        count += 1;
    });
    return count;
  }

  countFromClassSymTable(requiredKey: KINDS): number {
    let count: number = 0;
    Object.keys(this.classSymTable).forEach(key => {
      if (this.doesKindExist(requiredKey, this.classSymTable[key][KIND]))
        count += 1;
    });
    return count;
  }

  kindOf(name: string): ALL_KINDS {
    let kind: ALL_KINDS = ALL_KINDS.NONE;
    if (this.classSymTable.hasOwnProperty(name)) {
      kind = this.classSymTable[name][KIND];
    } else if (this.methodSymTable.hasOwnProperty(name)) {
      kind = this.methodSymTable[name][KIND];
    }

    return kind;
  }

  typeOf(name: string): string {
    let type: string = "UNKNOWN";
    if (this.classSymTable.hasOwnProperty(name)) {
      type = this.classSymTable[name][TYPE];
    } else if (this.methodSymTable.hasOwnProperty(name)) {
      type = this.methodSymTable[name][TYPE];
    }

    return type;
  }

  indexOf(name: string): number {
    let index: number = -1;
    if (this.classSymTable.hasOwnProperty(name)) {
      index = this.classSymTable[name][INDEX];
    } else if (this.methodSymTable.hasOwnProperty(name)) {
      index = this.methodSymTable[name][INDEX];
    }

    return index;
  }
}

// const symTable = new SymbolTable();
// symTable.define("dx", "int", KINDS.FIELD);
// symTable.define("dy", "int", KINDS.FIELD);
// symTable.define("dz", "int", KINDS.STATIC);
// symTable.define("x", "int", KINDS.VAR);
// symTable.define("y", "char", KINDS.VAR);
// symTable.startSubroutine();

// symTable.define("z", "char", KINDS.ARG);

// symTable.log();

export default SymbolTable;
