import Tokenizer, { TOKEN_TYPES, KEYWORDS } from "./tokenizer";
import * as fs from "fs";

function error(message: string, title: string = "Expected") {
  throw new Error(`${title} ${message}`);
}

const ops = ["+", "-", "*", "/", "&", "|", "<", ">", "="];
const unaryOps = ["-", "~"];

class CompilationEngine {
  private tokenizer: Tokenizer;
  private data: string = "";
  private inputFile: string = "";

  constructor(inputFile: string) {
    this.tokenizer = new Tokenizer(inputFile);
    this.inputFile = inputFile;
  }

  getData() {
    return this.data;
  }

  compileClass() {
    this.tokenizer.advance();

    if (
      this.assertNotToken(TOKEN_TYPES.KEYWORD, this.getKeyWord(KEYWORDS.CLASS))
    ) {
      error(' keyword "class"');
    }

    this.data += "<class>\n";
    this.data += this.getKeywordXml();

    this.tokenizer.advance();

    if (this.tokenizer.tokenType() !== TOKEN_TYPES.IDENTIFIER) {
      error(" identifier");
    }

    this.data += this.getIdentifierXml();

    this.tokenizer.advance();

    if (this.assertNotToken(TOKEN_TYPES.SYMBOL, "{")) {
      error(' "{" in class declaration');
    }

    this.data += this.getSymbolXml();

    this.compileClassVarDec();
    this.compileSubroutine();

    this.tokenizer.advance();
    if (this.assertNotToken(TOKEN_TYPES.SYMBOL, "}")) {
      error(' "}" in class declaration');
    }

    this.data += this.getSymbolXml();
    this.data += "</class>";

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
      error(' a "keyword"');
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

    this.data += "<classVarDec>\n";
    this.data += this.getKeywordXml();

    this.compileType();

    while (true) {
      this.tokenizer.advance();
      if (this.assertNotTokenType(TOKEN_TYPES.IDENTIFIER)) {
        error(' "Identifier"');
      }

      this.data += this.getIdentifierXml();

      this.tokenizer.advance();

      if (this.assertToken(TOKEN_TYPES.SYMBOL, ",")) {
        this.data += this.getSymbolXml();
      } else if (this.assertToken(TOKEN_TYPES.SYMBOL, ";")) {
        this.data += this.getSymbolXml();
        break;
      } else {
        error('";" | "," ');
      }
    }

    this.data += "</classVarDec>\n";

    this.compileClassVarDec();
  }

  compileType() {
    this.tokenizer.advance();
    if (
      this.assertTokenArray(TOKEN_TYPES.KEYWORD, [
        this.getKeyWord(KEYWORDS.BOOLEAN),
        this.getKeyWord(KEYWORDS.CHAR),
        this.getKeyWord(KEYWORDS.INT)
      ])
    ) {
      this.data += this.getKeywordXml();
    } else if (this.assertTokenType(TOKEN_TYPES.IDENTIFIER)) {
      this.data += this.getIdentifierXml();
    } else {
      error(' "int" | "char" | "boolean" | "className" for return type');
    }
  }

  getNonterminalXml(
    type: string,
    data: string = this.tokenizer.getCurrentToken()
  ) {
    return `<${type}> ${data} </${type}>\n`;
  }

  getSymbolXml() {
    return this.getNonterminalXml("symbol");
  }

  getIdentifierXml() {
    return this.getNonterminalXml("identifier");
  }

  getKeywordXml() {
    return this.getNonterminalXml("keyword");
  }

  getIntConstXml() {
    return this.getNonterminalXml("integerConstant");
  }

  getStringConstXml() {
    return this.getNonterminalXml(
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
      error(' "constructor" | "function" | "method"');
    }

    this.data += "<subroutineDec>\n";
    this.data += this.getKeywordXml();
    this.tokenizer.advance();

    if (this.assertToken(TOKEN_TYPES.KEYWORD, this.getKeyWord(KEYWORDS.VOID))) {
      this.data += this.getKeywordXml();
    } else if (this.assertTokenType(TOKEN_TYPES.IDENTIFIER)) {
      this.data += this.getIdentifierXml();
    } else {
      error(' "void" or "Identifier"');
    }

    this.tokenizer.advance();

    if (this.assertNotTokenType(TOKEN_TYPES.IDENTIFIER)) {
      error(' "Identifier"');
    }

    this.data += this.getIdentifierXml();
    this.tokenizer.advance();

    if (this.assertNotToken(TOKEN_TYPES.SYMBOL, "(")) {
      error(' "("');
    }
    this.data += this.getSymbolXml();

    this.compileParameterList();

    this.tokenizer.advance();
    this.errorNotToken(TOKEN_TYPES.SYMBOL, ")", ' ")"');

    this.data += this.getSymbolXml();

    this.compileSubroutineBody();

    this.data += "</subroutineDec>\n";

    this.compileSubroutine();
  }

  compileParameterList() {
    this.data += "<parameterList>\n";

    this.tokenizer.advance();
    if (this.assertToken(TOKEN_TYPES.SYMBOL, ")")) {
      this.data += "</parameterList>\n";
      this.tokenizer.back();
      return;
    }
    this.tokenizer.back();

    while (true) {
      this.compileType();

      this.tokenizer.advance();
      if (this.assertNotTokenType(TOKEN_TYPES.IDENTIFIER)) {
        error(' "Identifier"');
      }

      this.data += this.getIdentifierXml();
      this.tokenizer.advance();

      if (this.assertToken(TOKEN_TYPES.SYMBOL, ",")) {
        this.data += this.getSymbolXml();
      } else if (this.assertToken(TOKEN_TYPES.SYMBOL, ")")) {
        this.tokenizer.back();
        break;
      } else {
        error(' "," | ")"');
      }
    }

    this.data += "</parameterList>\n";
  }

  compileSubroutineBody() {
    this.tokenizer.advance();
    this.errorNotToken(
      TOKEN_TYPES.SYMBOL,
      "{",
      ' "}" in subroutine declaration'
    );

    this.data += "<subroutineBody>\n";
    this.data += this.getSymbolXml();

    this.compileVarDec();

    this.data += "<statements>\n";
    this.compileStatement();
    this.data += "</statements>\n";

    this.tokenizer.advance();

    this.errorNotToken(
      TOKEN_TYPES.SYMBOL,
      "}",
      '"}" in subroutine declaration'
    );

    this.data += this.getSymbolXml();
    this.data += "</subroutineBody>\n";
  }

  compileVarDec() {
    this.tokenizer.advance();

    if (
      this.assertNotToken(TOKEN_TYPES.KEYWORD, this.getKeyWord(KEYWORDS.VAR))
    ) {
      this.tokenizer.back();
      return;
    }

    this.data += "<varDec>\n";
    this.data += this.getKeywordXml();

    this.compileType();

    while (true) {
      this.tokenizer.advance();
      this.errorNotTokenType(
        TOKEN_TYPES.IDENTIFIER,
        "Identifier in variable declaration"
      );

      this.data += this.getIdentifierXml();
      this.tokenizer.advance();

      if (this.assertToken(TOKEN_TYPES.SYMBOL, ",")) {
        this.data += this.getSymbolXml();
      } else if (this.assertToken(TOKEN_TYPES.SYMBOL, ";")) {
        this.data += this.getSymbolXml();
        break;
      } else {
        error('"," | ";" in variable declaration');
      }
    }

    this.data += "</varDec>\n";

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
    this.tokenizer.advance();
    this.errorNotTokenType(TOKEN_TYPES.IDENTIFIER, '"Identifier"');
    this.data += this.getIdentifierXml();

    this.tokenizer.advance();
    if (this.assertToken(TOKEN_TYPES.SYMBOL, ".")) {
      this.data += this.getSymbolXml();

      this.tokenizer.advance();
      this.errorNotTokenType(TOKEN_TYPES.IDENTIFIER, '"Identifier"');
      this.data += this.getIdentifierXml();
    } else {
      this.tokenizer.back();
    }

    this.tokenizer.advance();
    this.errorNotToken(TOKEN_TYPES.SYMBOL, "(", "(");
    this.data += this.getSymbolXml();

    this.compileExpressionList();

    this.tokenizer.advance();
    this.errorNotToken(TOKEN_TYPES.SYMBOL, ")", ")");
    this.data += this.getSymbolXml();
  }

  compileDo() {
    this.data += "<doStatement>\n";
    this.data += this.getKeywordXml();
    this.compileSubroutineCall();

    this.tokenizer.advance();
    this.errorNotToken(TOKEN_TYPES.SYMBOL, ";", ";");
    this.data += this.getSymbolXml();
    this.data += "</doStatement>\n";
  }

  compileLet() {
    this.data += "<letStatement>\n";
    this.data += this.getKeywordXml();

    this.tokenizer.advance();
    this.errorNotTokenType(TOKEN_TYPES.IDENTIFIER, "Identifier");
    this.data += this.getIdentifierXml();

    this.tokenizer.advance();
    if (this.assertToken(TOKEN_TYPES.SYMBOL, "[")) {
      this.data += this.getSymbolXml();
      this.compileExpression();
      this.tokenizer.advance();
      this.errorNotToken(TOKEN_TYPES.SYMBOL, "]", "]");
      this.data += this.getSymbolXml();
    } else {
      this.tokenizer.back();
    }

    this.tokenizer.advance();
    this.errorNotToken(TOKEN_TYPES.SYMBOL, "=", '"="');
    this.data += this.getSymbolXml();

    this.compileExpression();

    this.tokenizer.advance();
    this.errorNotToken(TOKEN_TYPES.SYMBOL, ";", '";"');
    this.data += this.getSymbolXml();

    this.data += "</letStatement>\n";
  }

  compileWhile() {
    this.data += "<whileStatement>\n";
    this.data += this.getKeywordXml();

    this.tokenizer.advance();
    this.errorNotToken(TOKEN_TYPES.SYMBOL, "(", '"("');
    this.data += this.getSymbolXml();

    this.compileExpression();

    this.tokenizer.advance();
    this.errorNotToken(TOKEN_TYPES.SYMBOL, ")", '")"');
    this.data += this.getSymbolXml();

    this.tokenizer.advance();
    this.errorNotToken(TOKEN_TYPES.SYMBOL, "{", '"{"');
    this.data += this.getSymbolXml();

    this.data += "<statements>\n";
    this.compileStatement();
    this.data += "</statements>\n";

    this.tokenizer.advance();
    this.errorNotToken(TOKEN_TYPES.SYMBOL, "}", '"}"');
    this.data += this.getSymbolXml();

    this.data += "</whileStatement>\n";
  }

  compileReturn() {
    this.data += "<returnStatement>\n";
    this.data += this.getKeywordXml();

    this.tokenizer.advance();
    if (this.assertToken(TOKEN_TYPES.SYMBOL, ";")) {
      this.tokenizer.back();
    } else {
      this.tokenizer.back();
      this.compileExpression();
    }

    this.tokenizer.advance();
    this.errorNotToken(TOKEN_TYPES.SYMBOL, ";", '";"');
    this.data += this.getSymbolXml();

    this.data += "</returnStatement>\n";
  }

  compileIf() {
    this.data += "<ifStatement>\n";
    this.data += this.getKeywordXml();

    this.tokenizer.advance();
    this.errorNotToken(TOKEN_TYPES.SYMBOL, "(", '"("');
    this.data += this.getSymbolXml();

    this.compileExpression();

    this.tokenizer.advance();
    this.errorNotToken(TOKEN_TYPES.SYMBOL, ")", '")"');
    this.data += this.getSymbolXml();

    this.tokenizer.advance();
    this.errorNotToken(TOKEN_TYPES.SYMBOL, "{", '"{"');
    this.data += this.getSymbolXml();

    this.data += "<statements>\n";
    this.compileStatement();
    this.data += "</statements>\n";

    this.tokenizer.advance();
    this.errorNotToken(TOKEN_TYPES.SYMBOL, "}", '"}"');
    this.data += this.getSymbolXml();

    this.tokenizer.advance();
    if (this.assertToken(TOKEN_TYPES.KEYWORD, this.getKeyWord(KEYWORDS.ELSE))) {
      this.data += this.getKeywordXml();

      this.tokenizer.advance();
      this.errorNotToken(TOKEN_TYPES.SYMBOL, "{", '"{"');
      this.data += this.getSymbolXml();

      this.data += "<statements>\n";
      this.compileStatement();
      this.data += "</statements>\n";

      this.tokenizer.advance();
      this.errorNotToken(TOKEN_TYPES.SYMBOL, "}", '"}"');
      this.data += this.getSymbolXml();
    } else {
      this.tokenizer.back();
    }

    this.data += "</ifStatement>\n";
  }

  compileExpression() {
    this.data += "<expression>\n";
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

      if ([">", "<", "&"].indexOf(this.tokenizer.getCurrentToken()) !== -1) {
        this.data += this.getNonterminalXml(
          "symbol",
          this.convertSpeciallChars(this.tokenizer.getCurrentToken())
        );
      } else {
        this.data += this.getSymbolXml();
      }

      this.compileTerm();
    }
    this.data += "</expression>\n";
  }

  compileTerm() {
    this.data += "<term>\n";

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
      this.data += this.getIdentifierXml();
      this.tokenizer.advance();
      this.data += this.getSymbolXml();
      this.compileExpression();
      this.tokenizer.advance();
      this.errorNotToken(TOKEN_TYPES.SYMBOL, "]", "]");
      this.data += this.getSymbolXml();
    } else if (isSubroutCall) {
      this.tokenizer.back();
      this.compileSubroutineCall();
    } else if (isGroup) {
      this.data += this.getSymbolXml();
      this.compileExpression();
      this.tokenizer.advance();
      this.errorNotToken(TOKEN_TYPES.SYMBOL, ")", ")");
      this.data += this.getSymbolXml();
    } else if (isKeyConst) {
      this.data += this.getKeywordXml();
    } else if (isIntConst) {
      this.data += this.getIntConstXml();
    } else if (isStringConst) {
      this.data += this.getStringConstXml();
    } else if (isUnaryOp) {
      this.data += this.getSymbolXml();
      this.compileTerm();
    } else if (isIdentifier) {
      this.data += this.getIdentifierXml();
    }

    this.data += "</term>\n";
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
    this.data += "<expressionList>\n";
    this.tokenizer.advance();
    if (this.assertToken(TOKEN_TYPES.SYMBOL, ")")) {
      this.data += "</expressionList>\n";
      this.tokenizer.back();
      return;
    }

    this.tokenizer.back();

    while (true) {
      this.compileExpression();

      this.tokenizer.advance();
      if (this.assertToken(TOKEN_TYPES.SYMBOL, ",")) {
        this.data += this.getSymbolXml();
      } else if (this.assertToken(TOKEN_TYPES.SYMBOL, ")")) {
        this.tokenizer.back();
        break;
      } else {
        error('"," | ")"');
      }
    }

    this.data += "</expressionList>\n";
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
      currentToken == mThis ||
      currentToken == mTrue ||
      currentToken == mFalse ||
      currentToken == mNull
    );
  }
}

export default CompilationEngine;
