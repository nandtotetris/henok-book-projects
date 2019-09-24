import * as fs from "fs";

const MULTILINE_COMMENT = /\/\*([\s\S]*?)\*\//g;
const IDENTIFIER_REGEX = /[\w_]+/;
const STRING_REGEX = /"[^"]*"/g;
const SYMBOL_REGEX = /[[\]\\&\\*\\+\\(\\)\\.\\/\\,\-\\;\\~\\}\\|\\{\\>\\=\\<]/;
const NUMBER_REGEX = /[0-9]+/;

const REMOVE_COMMENT = /\/\/\s*[^\n]+/g;

export enum TOKEN_TYPES {
  KEYWORD = 1,
  SYMBOL,
  IDENTIFIER,
  INT_CONST,
  STRING_CONST
}

export enum KEYWORDS {
  CLASS = 1,
  METHOD,
  FUNCTION,
  CONSTRUCTOR,
  INT,
  BOOLEAN,
  CHAR,
  VOID,
  VAR,
  STATIC,
  FIELD,
  LET,
  DO,
  IF,
  ELSE,
  WHILE,
  RETURN,
  TRUE,
  FALSE,
  NULL,
  THIS
}

class Tokenizer {
  private data: string = "";
  private tokens: String[] = [];
  private normData: string;
  private currentToken: string;
  private currentIndex: number = -1;
  private tokenPatterns: RegExp;
  private keywordRegex: RegExp;

  constructor(filePath: string) {
    this.data = fs.readFileSync(filePath, "utf8");
    this.removeComment();
    this.normalizeData(this.preprocess());
    this.setTokenPatterns();
    this.tokenize();
  }

  getCurrentToken() {
    return this.currentToken;
  }

  tokenize() {
    this.normData.match(this.tokenPatterns).forEach(token => {
      this.tokens.push(token);
    });
  }

  setTokenPatterns() {
    let keywordString: string = "";
    for (let keyword in KEYWORDS) {
      var isValueProperty = parseInt(keyword, 10) >= 0;
      if (isValueProperty) {
        keywordString += KEYWORDS[keyword].toLowerCase() + "|";
      }
    }

    this.keywordRegex = new RegExp(
      keywordString.slice(0, keywordString.length - 1)
    );

    this.tokenPatterns = new RegExp(
      this.keywordRegex.source +
        "|" +
        SYMBOL_REGEX.source +
        "|" +
        NUMBER_REGEX.source +
        "|" +
        STRING_REGEX.source +
        "|" +
        IDENTIFIER_REGEX.source,
      "g"
    );
  }

  removeComment() {
    this.data = this.data.replace(REMOVE_COMMENT, "").trim();
    this.data = this.data.replace(MULTILINE_COMMENT, "").trim();
  }

  preprocess() {
    const splitCommands = this.data.split("\n");

    const instructions = splitCommands.filter(instruction => {
      return instruction.trim().length > 0;
    });

    return this.trimCommands(instructions);
  }

  trimCommands(instructions: String[]) {
    let sanitizedCommands = instructions.map(vmCommand => {
      return vmCommand.trim();
    });
    return sanitizedCommands;
  }

  normalizeData(instructions: String[]) {
    let normData = "";
    instructions.forEach(instruction => {
      normData += `${instruction}\n`;
    });

    this.normData = normData;
  }

  hasMoreTokens(): boolean {
    return this.currentIndex < this.tokens.length - 1;
  }

  isNotTokensEmpty(): boolean {
    return this.currentIndex >= 1;
  }

  advance() {
    if (this.hasMoreTokens()) {
      this.currentIndex += 1;
      this.currentToken = this.tokens[this.currentIndex] + "";
    }
  }

  back() {
    if (this.isNotTokensEmpty()) {
      this.currentIndex -= 1;
      this.currentToken = this.tokens[this.currentIndex] + "";
    }
  }

  tokenType(): TOKEN_TYPES {
    let type: TOKEN_TYPES;
    const token = this.currentToken;
    if (this.keywordRegex.test(token)) {
      type = TOKEN_TYPES.KEYWORD;
    } else if (SYMBOL_REGEX.test(token)) {
      type = TOKEN_TYPES.SYMBOL;
    } else if (NUMBER_REGEX.test(token)) {
      type = TOKEN_TYPES.INT_CONST;
    } else if (STRING_REGEX.test(token)) {
      type = TOKEN_TYPES.STRING_CONST;
    } else if (IDENTIFIER_REGEX.test(token)) {
      type = TOKEN_TYPES.IDENTIFIER;
    }

    return type;
  }

  keyword(): String {
    if (this.tokenType() == TOKEN_TYPES.KEYWORD) {
      return this.currentToken;
    }
  }

  symbol(): String {
    if (this.tokenType() == TOKEN_TYPES.SYMBOL) {
      return this.currentToken;
    }
  }

  identifier(): String {
    if (this.tokenType() == TOKEN_TYPES.IDENTIFIER) {
      return this.currentToken;
    }
  }

  intVal(): number {
    if (this.tokenType() == TOKEN_TYPES.INT_CONST) {
      return parseInt(this.currentToken);
    }
  }

  stringVal(): String {
    if (this.tokenType() == TOKEN_TYPES.STRING_CONST) {
      return this.currentToken;
    }
  }
}

export default Tokenizer;
