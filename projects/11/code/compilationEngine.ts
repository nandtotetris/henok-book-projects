import Tokenizer, { TOKEN_TYPES, KEYWORDS } from "./tokenizer";
import SymbolTable, { KINDS, ALL_KINDS } from "./symbolTable";
import VMWritter, { SEGMENTS, VM_COMMANDS } from "./VMWriter";

function error(message: string, title: string = "Expected") {
  throw new Error(`${title} ${message}`);
}

const IF_TRUE = "IF_TRUE";
const IF_FALSE = "IF_FALSE";
const IF_END = "IF_END";
const WHILE_EXP = "WHILE_EXP";
const WHILE_END = "WHILE_END";

const ops = ["+", "-", "*", "/", "&", "|", "<", ">", "="];
const unaryOps = ["-", "~"];

class CompilationEngine {
  private symTable: SymbolTable;
  private currentClassName: string;
  private currentFunctionName: string;
  private labelIndex: number = -1;
  private whileIndex: number = -1;
  private vmWritter: VMWritter;
  private tokenizer: Tokenizer;
  // private data: string = "";

  constructor(inputFile: string) {
    this.tokenizer = new Tokenizer(inputFile);
    this.vmWritter = new VMWritter("");
    this.symTable = new SymbolTable();
  }

  getIfTrue(index: number) {
    return `${IF_TRUE}${index}`;
  }

  getIfFalse(index: number) {
    return `${IF_FALSE}${index}`;
  }

  getIfEnd(index: number) {
    return `${IF_END}${index}`;
  }

  getWhileExp(index: number) {
    return `${WHILE_EXP}${index}`;
  }

  getWhileEnd(index: number) {
    return `${WHILE_END}${index}`;
  }

  getLabel(index: number) {
    return `L${index}`;
  }

  incLabelIndex() {
    this.labelIndex += 1;
  }

  getSymData() {
    this.symTable.log();
  }

  getVMData() {
    return this.vmWritter.getData();
  }

  compileClass() {
    this.tokenizer.advance();

    if (
      this.assertNotToken(TOKEN_TYPES.KEYWORD, this.getKeyWord(KEYWORDS.CLASS))
    ) {
      error('keyword "class"');
    }

    this.tokenizer.advance();

    if (this.tokenizer.tokenType() !== TOKEN_TYPES.IDENTIFIER) {
      error("identifier");
    }

    this.currentClassName = this.tokenizer.getCurrentToken();
    this.tokenizer.advance();

    if (this.assertNotToken(TOKEN_TYPES.SYMBOL, "{")) {
      error(' "{" in class declaration');
    }

    this.compileClassVarDec();
    this.compileSubroutine();

    this.tokenizer.advance();
    if (this.assertNotToken(TOKEN_TYPES.SYMBOL, "}")) {
      error(' "}" in class declaration');
    }

    if (this.tokenizer.hasMoreTokens()) {
      error("tokens", "Unexpected");
    }
  }

  assertTokenArray(type: TOKEN_TYPES, symbols: string[]) {
    let result: boolean = false;
    symbols.forEach(symbol => {
      if (result === true) symbols.length == 0;
      result = result || this.assertToken(type, symbol);
    });

    return result;
  }

  assertNotTokenArray(type: TOKEN_TYPES, symbols: string[]) {
    let result: boolean = true;
    symbols.forEach(symbol => {
      if (result === false) symbols.length == 0;
      result = result && this.assertNotToken(type, symbol);
    });

    return result;
  }

  assertToken(type: TOKEN_TYPES, symbol: string) {
    let isTrue = false;
    if (
      this.tokenizer.getCurrentToken() === symbol &&
      this.tokenizer.tokenType() === type
    ) {
      isTrue = true;
    }

    return isTrue;
  }

  assertNotToken(type: TOKEN_TYPES, symbol: string) {
    return !this.assertToken(type, symbol);
  }

  errorNotToken(type: TOKEN_TYPES, symbol: string, message: string) {
    if (this.assertNotToken(type, symbol)) {
      error(message);
    }
  }

  assertTokenType(type: TOKEN_TYPES) {
    return this.tokenizer.tokenType() === type;
  }

  assertNotTokenType(type: TOKEN_TYPES) {
    return !this.assertTokenType(type);
  }

  errorNotTokenType(type: TOKEN_TYPES, message: string) {
    if (this.assertNotTokenType(type)) {
      error(message);
    }
  }

  errorNotOp(message: string) {
    if (!this.isOp()) error(message);
  }

  assertNotTokenTypeArray(types: TOKEN_TYPES[]) {
    let result: boolean = false;
    types.forEach(type => {
      if (result === true) types.length == 0;
      result = result || this.assertNotTokenType(type);
    });

    return result;
  }

  getKeyWord(code: KEYWORDS) {
    return KEYWORDS[code].toLowerCase();
  }

  compileClassVarDec() {
    this.tokenizer.advance();

    if (this.assertToken(TOKEN_TYPES.SYMBOL, "}")) {
      this.tokenizer.back();
      return;
    }

    if (this.assertNotTokenType(TOKEN_TYPES.KEYWORD)) {
      error('a "keyword"');
    }

    if (
      this.assertTokenArray(TOKEN_TYPES.KEYWORD, [
        this.getKeyWord(KEYWORDS.CONSTRUCTOR),
        this.getKeyWord(KEYWORDS.FUNCTION),
        this.getKeyWord(KEYWORDS.METHOD)
      ])
    ) {
      this.tokenizer.back();
      return;
    }
    if (
      this.assertNotToken(
        TOKEN_TYPES.KEYWORD,
        this.getKeyWord(KEYWORDS.STATIC)
      ) &&
      this.assertNotToken(TOKEN_TYPES.KEYWORD, this.getKeyWord(KEYWORDS.FIELD))
    ) {
      error(" static | field in class variable decalarations");
    }

    let kind: KINDS;
    switch (this.tokenizer.getCurrentToken()) {
      case this.getKeyWord(KEYWORDS.FIELD):
        kind = KINDS.FIELD;
        break;
      case this.getKeyWord(KEYWORDS.STATIC):
        kind = KINDS.STATIC;
        break;
    }

    const type = this.compileType();

    while (true) {
      this.tokenizer.advance();
      if (this.assertNotTokenType(TOKEN_TYPES.IDENTIFIER)) {
        error(' "Identifier"');
      }

      this.symTable.define(this.tokenizer.getCurrentToken(), type, kind);

      this.tokenizer.advance();

      if (this.assertToken(TOKEN_TYPES.SYMBOL, ",")) {
      } else if (this.assertToken(TOKEN_TYPES.SYMBOL, ";")) {
        break;
      } else {
        error('";" | "," ');
      }
    }

    this.compileClassVarDec();
  }

  compileType() {
    let type: string = "";
    this.tokenizer.advance();
    if (
      this.assertTokenArray(TOKEN_TYPES.KEYWORD, [
        this.getKeyWord(KEYWORDS.BOOLEAN),
        this.getKeyWord(KEYWORDS.CHAR),
        this.getKeyWord(KEYWORDS.INT)
      ])
    ) {
      type = this.tokenizer.keyword();
    } else if (this.assertTokenType(TOKEN_TYPES.IDENTIFIER)) {
      type = this.tokenizer.identifier();
    } else {
      error('"int" | "char" | "boolean" | "className" for return type');
    }

    return type;
  }

  getTerminalXml(
    type: string,
    data: string = this.tokenizer.getCurrentToken(),
    extra: string = ""
  ) {
    return `<${type} ${extra}> ${data} </${type}>\n`;
  }

  getSymbolXml() {
    return this.getTerminalXml("symbol");
  }

  getIdentifierXml(
    category: string = "",
    isBeingDefined: boolean = false,
    kind: KINDS = 1,
    index: number = -1
  ) {
    return this.getTerminalXml("identifier");
  }

  getKeywordXml() {
    return this.getTerminalXml("keyword");
  }

  getIntConstXml() {
    return this.getTerminalXml("integerConstant");
  }

  getStringConstXml() {
    return this.getTerminalXml(
      "stringConstant",
      this.tokenizer.getCurrentToken().replace(/"/g, "")
    );
  }

  compileSubroutine() {
    this.tokenizer.advance();

    if (this.assertToken(TOKEN_TYPES.SYMBOL, "}")) {
      this.tokenizer.back();
      return;
    }

    const constructor = this.getKeyWord(KEYWORDS.CONSTRUCTOR);
    const myFunction = this.getKeyWord(KEYWORDS.FUNCTION);
    const method = this.getKeyWord(KEYWORDS.METHOD);

    if (
      this.assertNotTokenArray(TOKEN_TYPES.KEYWORD, [
        constructor,
        myFunction,
        method
      ])
    ) {
      error('"constructor" | "function" | "method"');
    }

    const keyword = this.tokenizer.keyword();
    this.symTable.startSubroutine();

    this.tokenizer.advance();

    if (this.assertToken(TOKEN_TYPES.KEYWORD, this.getKeyWord(KEYWORDS.VOID))) {
    } else {
      this.tokenizer.back();
      this.compileType();
    }

    this.tokenizer.advance();

    if (this.assertNotTokenType(TOKEN_TYPES.IDENTIFIER)) {
      error('"Identifier"');
    }

    this.currentFunctionName = this.tokenizer.getCurrentToken();

    this.tokenizer.advance();

    if (this.assertNotToken(TOKEN_TYPES.SYMBOL, "(")) {
      error(' "("');
    }

    if (keyword === this.getKeyWord(KEYWORDS.METHOD)) {
      this.symTable.define("this", this.currentClassName, KINDS.ARG);
    }

    this.compileParameterList();

    this.tokenizer.advance();
    this.errorNotToken(TOKEN_TYPES.SYMBOL, ")", ' ")"');

    this.compileSubroutineBody(keyword);

    this.compileSubroutine();
  }

  compileParameterList() {
    this.tokenizer.advance();
    if (this.assertToken(TOKEN_TYPES.SYMBOL, ")")) {
      this.tokenizer.back();
      return;
    }
    this.tokenizer.back();

    while (true) {
      const type = this.compileType();

      this.tokenizer.advance();
      if (this.assertNotTokenType(TOKEN_TYPES.IDENTIFIER)) {
        error('"Identifier"');
      }

      const identifier = this.tokenizer.identifier();
      this.symTable.define(identifier, type, KINDS.ARG);

      this.tokenizer.advance();

      if (this.assertToken(TOKEN_TYPES.SYMBOL, ",")) {
      } else if (this.assertToken(TOKEN_TYPES.SYMBOL, ")")) {
        this.tokenizer.back();
        break;
      } else {
        error(' "," | ")"');
      }
    }
  }

  compileSubroutineBody(subroutineType: string) {
    this.tokenizer.advance();
    this.errorNotToken(
      TOKEN_TYPES.SYMBOL,
      "{",
      ' "{" in subroutine declaration'
    );

    this.compileVarDec();

    this.vmWritter.writeFunction(
      `${this.currentClassName}.${this.currentFunctionName}`,
      this.symTable.varCount(KINDS.VAR)
    );

    switch (subroutineType) {
      case this.getKeyWord(KEYWORDS.METHOD):
        this.vmWritter.writePush(SEGMENTS.ARG, 0);
        this.vmWritter.writePop(SEGMENTS.POINTER, 0);
        break;
      case this.getKeyWord(KEYWORDS.CONSTRUCTOR):
        const numberOfFields = this.symTable.varCount(KINDS.FIELD);
        this.vmWritter.writePush(SEGMENTS.CONSTANT, numberOfFields);
        this.vmWritter.writeCommand("call Memory.alloc 1");
        this.vmWritter.writePop(SEGMENTS.POINTER, 0);
    }

    this.compileStatement();

    this.tokenizer.advance();

    this.errorNotToken(
      TOKEN_TYPES.SYMBOL,
      "}",
      '"}" in subroutine declaration'
    );
  }

  compileVarDec() {
    this.tokenizer.advance();

    if (
      this.assertNotToken(TOKEN_TYPES.KEYWORD, this.getKeyWord(KEYWORDS.VAR))
    ) {
      this.tokenizer.back();
      return;
    }

    const type = this.compileType();

    while (true) {
      this.tokenizer.advance();
      this.errorNotTokenType(
        TOKEN_TYPES.IDENTIFIER,
        "Identifier in variable declaration"
      );

      this.symTable.define(this.tokenizer.getCurrentToken(), type, KINDS.VAR);

      this.tokenizer.advance();

      if (this.assertToken(TOKEN_TYPES.SYMBOL, ",")) {
      } else if (this.assertToken(TOKEN_TYPES.SYMBOL, ";")) {
        break;
      } else {
        error('"," | ";" in variable declaration');
      }
    }

    this.compileVarDec();
  }

  compileStatement() {
    this.tokenizer.advance();

    if (this.assertToken(TOKEN_TYPES.SYMBOL, "}")) {
      this.tokenizer.back();
      return;
    }

    const mLet = this.getKeyWord(KEYWORDS.LET);
    const mIf = this.getKeyWord(KEYWORDS.IF);
    const mWhile = this.getKeyWord(KEYWORDS.WHILE);
    const mDo = this.getKeyWord(KEYWORDS.DO);
    const mReturn = this.getKeyWord(KEYWORDS.RETURN);

    this.errorNotTokenType(TOKEN_TYPES.KEYWORD, '"a keyword"');

    switch (this.tokenizer.getCurrentToken()) {
      case mLet:
        this.compileLet();
        break;
      case mIf:
        this.compileIf();
        break;
      case mWhile:
        this.compileWhile();
        break;
      case mDo:
        this.compileDo();
        break;
      case mReturn:
        this.compileReturn();
        break;
      default:
        error('statement "let" | "if" | "while" | "do" | "return"');
    }

    this.compileStatement();
  }

  compileSubroutineCall() {
    let identifier: string = "";
    let numberOfArguments: number = 0;
    this.tokenizer.advance();
    this.errorNotTokenType(TOKEN_TYPES.IDENTIFIER, '"Identifier"');
    identifier = this.tokenizer.getCurrentToken();
    let isMethodCall: boolean = false;

    this.tokenizer.advance();
    if (this.assertToken(TOKEN_TYPES.SYMBOL, ".")) {
      const objectName: string = identifier;

      this.tokenizer.advance();
      this.errorNotTokenType(TOKEN_TYPES.IDENTIFIER, '"Identifier"');

      const functionName = this.tokenizer.getCurrentToken();

      if (this.symTable.kindOf(objectName) !== ALL_KINDS.NONE) {
        const type = this.symTable.typeOf(objectName);
        isMethodCall = true;
        this.vmWritter.writePush(
          this.convertKindToSegment(this.symTable.kindOf(objectName)),
          this.symTable.indexOf(objectName)
        );

        identifier = `${type}.${functionName}`;
      } else {
        identifier += `.${functionName}`;
      }
    } else {
      isMethodCall = true;
      this.vmWritter.writePush(SEGMENTS.POINTER, 0);
      identifier = `${this.currentClassName}.${identifier}`;
      this.tokenizer.back();
    }

    this.tokenizer.advance();
    this.errorNotToken(TOKEN_TYPES.SYMBOL, "(", "(");

    numberOfArguments = this.compileExpressionList();
    if (isMethodCall) {
      numberOfArguments += 1;
    }

    this.tokenizer.advance();
    this.errorNotToken(TOKEN_TYPES.SYMBOL, ")", ")");

    this.vmWritter.writeCall(identifier, numberOfArguments);
  }

  compileDo() {
    this.compileSubroutineCall();

    this.tokenizer.advance();
    this.errorNotToken(TOKEN_TYPES.SYMBOL, ";", ";");

    this.vmWritter.writePop(SEGMENTS.TEMP, 0);
  }

  compileLet() {
    this.tokenizer.advance();
    this.errorNotTokenType(TOKEN_TYPES.IDENTIFIER, "Identifier");

    const identifier = this.tokenizer.identifier();
    const identifierKind = this.symTable.kindOf(identifier);
    const identifierIndex = this.symTable.indexOf(identifier);

    let isArray = false;

    this.tokenizer.advance();
    if (this.assertToken(TOKEN_TYPES.SYMBOL, "[")) {
      isArray = true;

      this.compileExpression();
      this.vmWritter.writePush(
        this.convertKindToSegment(identifierKind),
        identifierIndex
      );
      this.vmWritter.writeArithmetic(VM_COMMANDS.ADD);
      this.tokenizer.advance();
      this.errorNotToken(TOKEN_TYPES.SYMBOL, "]", "]");
    } else {
      this.tokenizer.back();
    }

    this.tokenizer.advance();
    this.errorNotToken(TOKEN_TYPES.SYMBOL, "=", '"="');

    this.compileExpression();

    if (isArray) {
      this.vmWritter.writePop(SEGMENTS.TEMP, 0);
      this.vmWritter.writePop(SEGMENTS.POINTER, 1);
      this.vmWritter.writePush(SEGMENTS.TEMP, 0);
      this.vmWritter.writePop(SEGMENTS.THAT, 0);
    } else {
      this.vmWritter.writePop(
        this.convertKindToSegment(identifierKind),
        identifierIndex
      );
    }

    this.tokenizer.advance();
    this.errorNotToken(TOKEN_TYPES.SYMBOL, ";", '";"');
  }

  compileWhile() {
    const whileIndex = ++this.whileIndex;

    this.vmWritter.writeLabel(this.getWhileExp(whileIndex));

    this.tokenizer.advance();
    this.errorNotToken(TOKEN_TYPES.SYMBOL, "(", '"("');

    this.compileExpression();

    this.tokenizer.advance();
    this.errorNotToken(TOKEN_TYPES.SYMBOL, ")", '")"');

    this.compileUniaryOp("~");
    this.vmWritter.writeIf(this.getWhileEnd(whileIndex));

    this.tokenizer.advance();
    this.errorNotToken(TOKEN_TYPES.SYMBOL, "{", '"{"');

    this.compileStatement();

    this.tokenizer.advance();
    this.errorNotToken(TOKEN_TYPES.SYMBOL, "}", '"}"');

    this.vmWritter.writeGoto(this.getWhileExp(whileIndex));

    this.vmWritter.writeLabel(this.getWhileEnd(whileIndex));
  }

  compileReturn() {
    this.tokenizer.advance();
    if (this.assertToken(TOKEN_TYPES.SYMBOL, ";")) {
      this.vmWritter.writePush(SEGMENTS.CONSTANT, 0);
      this.tokenizer.back();
    } else {
      // if (this.currentFunctionReturnType === this.getKeyWord(KEYWORDS.VOID)) {
      //   error('"A non void function must return a value"');
      // }
      this.tokenizer.back();
      this.compileExpression();
    }

    this.vmWritter.writeReturn();

    this.tokenizer.advance();
    this.errorNotToken(TOKEN_TYPES.SYMBOL, ";", '";"');

    // if (this.currentMethodReturnType === this.getKeyWord(KEYWORDS.VOID)) {
    //   vmCmds += voidCmd;
    // }
  }

  compileIf() {
    const labelIndex = ++this.labelIndex;

    this.tokenizer.advance();
    this.errorNotToken(TOKEN_TYPES.SYMBOL, "(", '"("');

    this.compileExpression();

    this.tokenizer.advance();
    this.errorNotToken(TOKEN_TYPES.SYMBOL, ")", '")"');

    this.tokenizer.advance();
    this.errorNotToken(TOKEN_TYPES.SYMBOL, "{", '"{"');

    this.vmWritter.writeIf(this.getIfTrue(labelIndex));
    this.vmWritter.writeGoto(this.getIfFalse(labelIndex));
    this.vmWritter.writeLabel(this.getIfTrue(labelIndex));

    this.compileStatement();

    this.tokenizer.advance();
    this.errorNotToken(TOKEN_TYPES.SYMBOL, "}", '"}"');

    this.tokenizer.advance();
    if (this.assertToken(TOKEN_TYPES.KEYWORD, this.getKeyWord(KEYWORDS.ELSE))) {
      this.vmWritter.writeGoto(this.getIfEnd(labelIndex));

      this.tokenizer.advance();
      this.errorNotToken(TOKEN_TYPES.SYMBOL, "{", '"{"');

      this.vmWritter.writeLabel(this.getIfFalse(labelIndex));

      this.compileStatement();
      this.tokenizer.advance();
      this.errorNotToken(TOKEN_TYPES.SYMBOL, "}", '"}"');
      this.vmWritter.writeLabel(this.getIfEnd(labelIndex));
    } else {
      this.tokenizer.back();
      this.vmWritter.writeLabel(this.getIfFalse(labelIndex));
    }
  }

  compileExpression() {
    this.compileTerm();

    while (true) {
      this.tokenizer.advance();
      if (this.assertTokenArray(TOKEN_TYPES.SYMBOL, [";", "]", ")", ","])) {
        this.tokenizer.back();
        break;
      }

      this.errorNotOp(
        (() => {
          let message = "";
          for (let i = 0; i < ops.length; i++) {
            message += `${ops[i]} ${i == ops.length - 1 ? "" : " | "}`;
          }
          return message;
        })()
      );

      const vmCommand = this.getVMCommand(this.tokenizer.getCurrentToken());

      if ([">", "<", "&"].indexOf(this.tokenizer.getCurrentToken()) !== -1) {
        //   "symbol",
        //   this.convertSpeciallChars(this.tokenizer.getCurrentToken())
        // );
      } else {
      }

      this.compileTerm();
      this.vmWritter.writeCommand(vmCommand);
    }
  }

  getVMCommand(op: string) {
    let cmd: string = "";
    switch (op) {
      case "+":
        cmd = "add";
        break;
      case "-":
        cmd = "sub";
        break;
      case "*":
        cmd = "call Math.multiply 2";
        break;
      case "/":
        cmd = "call Math.divide 2";
        break;
      case "&":
        cmd = "and";
        break;
      case "|":
        cmd = "or";
        break;
      case "<":
        cmd = "lt";
        break;
      case ">":
        cmd = "gt";
        break;
      case "=":
        cmd = "eq";
        break;
      default:
        cmd = "XXXX";
        break;
    }

    return cmd;
  }

  compileTerm() {
    this.tokenizer.advance();

    const isNotIdentifier = this.assertNotTokenType(TOKEN_TYPES.IDENTIFIER);
    const isKeyConst = this.isKeywordConstant();
    const isNotIntConst = this.assertNotTokenType(TOKEN_TYPES.INT_CONST);
    const isNotStringConst = this.assertNotTokenType(TOKEN_TYPES.STRING_CONST);
    const isUnaryOp = this.isUnaryOp();
    const isArrary = this.isArrayCommand();
    const isGroup = this.isGrouping();
    const isSubroutCall = this.isSubroutineCall();

    if (
      isNotIdentifier &&
      !isKeyConst &&
      isNotIntConst &&
      isNotStringConst &&
      !isUnaryOp &&
      !isArrary &&
      !isGroup &&
      !isSubroutCall
    ) {
      error(
        '"Identifier" | "this" | "true" | "false" | "null" | "integerConstant" | \
        "stringConstant" | "-" | "~" | "[]" | "()" | "x()" || "x.y()"'
      );
    }

    const isIdentifier = !isNotIdentifier;
    const isIntConst = !isNotIntConst;
    const isStringConst = !isNotStringConst;
    if (isArrary) {
      const identifier = this.tokenizer.identifier();
      const identifierKind = this.symTable.kindOf(identifier);
      const identifierIndex = this.symTable.indexOf(identifier);

      this.tokenizer.advance();

      this.compileExpression();
      this.vmWritter.writePush(
        this.convertKindToSegment(identifierKind),
        identifierIndex
      );
      this.vmWritter.writeArithmetic(VM_COMMANDS.ADD);
      this.vmWritter.writePop(SEGMENTS.POINTER, 1);
      this.vmWritter.writePush(SEGMENTS.THAT, 0);

      this.tokenizer.advance();
      this.errorNotToken(TOKEN_TYPES.SYMBOL, "]", "]");
    } else if (isSubroutCall) {
      this.tokenizer.back();
      this.compileSubroutineCall();
    } else if (isGroup) {
      this.compileExpression();
      this.tokenizer.advance();
      this.errorNotToken(TOKEN_TYPES.SYMBOL, ")", ")");
    } else if (isKeyConst) {
      const keyword = this.tokenizer.keyword();
      this.compileKeyConstant(keyword);
    } else if (isIntConst) {
      this.vmWritter.writePush(SEGMENTS.CONSTANT, this.tokenizer.intVal());
    } else if (isStringConst) {
      // const strLiteral = STRING_REGEX.exec(this.tokenizer.stringVal())[
      //   FIRST_MATCH
      // ];
      // console.log(strLiteral);
      const str: string = this.tokenizer.stringVal();
      const firstExcludeQuote = str.slice(1, str.length);
      const secondExcludeQuote = firstExcludeQuote.slice(
        0,
        firstExcludeQuote.length - 1
      );
      this.compileStringConstant(secondExcludeQuote);
    } else if (isUnaryOp) {
      const symbol = this.tokenizer.symbol();
      this.compileTerm();
      this.compileUniaryOp(symbol);
    } else if (isIdentifier) {
      const identifier = this.tokenizer.identifier();
      const identifierKind = this.symTable.kindOf(identifier);
      const identifierIndex = this.symTable.indexOf(identifier);

      this.vmWritter.writePush(
        this.convertKindToSegment(identifierKind),
        identifierIndex
      );
    }
  }

  compileKeyConstant(keyword: string) {
    switch (keyword) {
      case this.getKeyWord(KEYWORDS.TRUE):
        this.vmWritter.writePush(SEGMENTS.CONSTANT, 0);
        this.compileUniaryOp("~");
        break;
      case this.getKeyWord(KEYWORDS.NULL):
      case this.getKeyWord(KEYWORDS.FALSE):
        this.vmWritter.writePush(SEGMENTS.CONSTANT, 0);
        break;
      case this.getKeyWord(KEYWORDS.THIS):
        this.vmWritter.writePush(SEGMENTS.POINTER, 0);
        break;
    }
  }

  compileStringConstant(str: string) {
    const len = str.length;
    this.vmWritter.writePush(SEGMENTS.CONSTANT, len);
    this.vmWritter.writeCall("String.new", 1);

    for (let i = 0; i < len; i++) {
      const asciiCode = str.charCodeAt(i);
      this.vmWritter.writePush(SEGMENTS.CONSTANT, asciiCode);
      this.vmWritter.writeCall("String.appendChar", 2);
    }
  }

  compileUniaryOp(symbol: string) {
    let cmd: string;
    switch (symbol) {
      case "-":
        cmd = "neg";
        break;
      case "~":
        cmd = "not";
        break;
    }

    this.vmWritter.writeCommand(cmd);
  }

  convertSpeciallChars(token: string) {
    let symbol: string = "";
    switch (token) {
      case ">":
        symbol = "&gt;";
        break;
      case "<":
        symbol = "&lt;";
        break;
      case "&":
        symbol = "&amp;";
        break;
      default:
        symbol = "TODO";
    }

    return symbol;
  }

  isGrouping(): boolean {
    return this.assertToken(TOKEN_TYPES.SYMBOL, "(");
  }

  checkIdentfierThenCall() {
    let result: boolean = false;
    if (this.assertTokenType(TOKEN_TYPES.IDENTIFIER)) {
      this.tokenizer.advance();
      if (this.assertToken(TOKEN_TYPES.SYMBOL, "(")) {
        result = true;
      }
      this.tokenizer.back();
    }

    return result;
  }

  isSubroutineCall(): boolean {
    let result: boolean = false;
    if (this.checkIdentfierThenCall()) result = true;

    if (this.assertTokenType(TOKEN_TYPES.IDENTIFIER)) {
      this.tokenizer.advance();
      if (this.assertToken(TOKEN_TYPES.SYMBOL, ".")) {
        this.tokenizer.advance();
        if (this.checkIdentfierThenCall()) result = true;
        this.tokenizer.back();
      }
      this.tokenizer.back();
    }
    return result;
  }

  isArrayCommand(): boolean {
    let result: boolean = false;
    if (this.assertTokenType(TOKEN_TYPES.IDENTIFIER)) {
      this.tokenizer.advance();
      if (this.assertToken(TOKEN_TYPES.SYMBOL, "[")) {
        result = true;
      }
      this.tokenizer.back();
    }
    return result;
  }

  compileExpressionList() {
    let numberOfArguments: number = 0;

    this.tokenizer.advance();
    if (this.assertToken(TOKEN_TYPES.SYMBOL, ")")) {
      this.tokenizer.back();
      return numberOfArguments;
    }

    this.tokenizer.back();

    numberOfArguments += 1;
    while (true) {
      this.compileExpression();

      this.tokenizer.advance();
      if (this.assertToken(TOKEN_TYPES.SYMBOL, ",")) {
        numberOfArguments += 1;
      } else if (this.assertToken(TOKEN_TYPES.SYMBOL, ")")) {
        this.tokenizer.back();
        break;
      } else {
        error('"," | ")"');
      }
    }

    return numberOfArguments;
  }

  convertKindToSegment(kind: ALL_KINDS): SEGMENTS {
    let segment: SEGMENTS;
    switch (kind) {
      case ALL_KINDS.ARG:
        segment = SEGMENTS.ARG;
        break;
      case ALL_KINDS.FIELD:
        segment = SEGMENTS.THIS;
        break;
      case ALL_KINDS.STATIC:
        segment = SEGMENTS.STATIC;
        break;
      case ALL_KINDS.VAR:
        segment = SEGMENTS.LOCAL;
        break;
    }

    return segment;
  }

  isOp() {
    const currentToken = this.tokenizer.getCurrentToken();
    return ops.indexOf(currentToken) !== -1;
  }

  isUnaryOp() {
    const currentToken = this.tokenizer.getCurrentToken();
    return unaryOps.indexOf(currentToken) !== -1;
  }

  isKeywordConstant() {
    const currentToken = this.tokenizer.getCurrentToken();
    const mThis = this.getKeyWord(KEYWORDS.THIS);
    const mTrue = this.getKeyWord(KEYWORDS.TRUE);
    const mFalse = this.getKeyWord(KEYWORDS.FALSE);
    const mNull = this.getKeyWord(KEYWORDS.NULL);

    return (
      currentToken === mThis ||
      currentToken === mTrue ||
      currentToken === mFalse ||
      currentToken === mNull
    );
  }
}

export default CompilationEngine;
