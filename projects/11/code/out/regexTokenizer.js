// import * as fs from "fs";
// const LETTER_REGEX = /[a-zA-Z]/;
// const SYMBOL_REGEX = /[[\]\\&\\*\\+\\(\\)\\.\\/\\,\\-\\;\\~\\}\\|\\{\\>\\=\\<]/;
// const NUMBER_REGEX = /[0-9]/;
// const REMOVE_COMMENT = /\/\/\s*[^\n]+/g;
// enum STATE_TYPE {
//   INITIAL,
//   INT_CONST,
//   STRING_CONST,
//   KEYWORD_AND_IDENTIFIER,
//   SYMBOL
// }
// enum TOKEN_TYPES {
//   KEYWORD = 1,
//   SYMBOL,
//   IDENTIFIER,
//   INT_CONST,
//   STRING_CONST
// }
// enum KEYWORDS {
//   CLASS = 1,
//   METHOD,
//   FUNCTION,
//   CONSTRUCTOR,
//   INT,
//   BOOLEAN,
//   CHAR,
//   VOID,
//   VAR,
//   STATIC,
//   FIELD,
//   LET,
//   DO,
//   IF,
//   ELSE,
//   WHILE,
//   RETURN,
//   TRUE,
//   FALSE,
//   NULL,
//   THIS
// }
// class Tokenizer {
//   private data: String = "";
//   private tokens: String[];
//   private normData: String;
//   private currentToken: String;
//   constructor(filePath: string) {
//     this.data = fs.readFileSync(filePath, "utf8");
//     this.removeComment();
//     this.normalizeData(this.preprocess());
//     // this.tokenize();
//     console.log(this.normData);
//   }
//   tokenize() {
//     let state: STATE_TYPE = STATE_TYPE.INITIAL;
//     for (let i = 0; i < this.normData.length; i++) {
//       const char = this.normData[i];
//       switch (state) {
//         case STATE_TYPE.INITIAL:
//           state = this.handleInitialState(char);
//           break;
//         case STATE_TYPE.INT_CONST:
//           state = this.handleIntConstState(char);
//           break;
//         case STATE_TYPE.STRING_CONST:
//           state = this.handleStringConstState(char);
//           break;
//         case STATE_TYPE.SYMBOL:
//           state = this.handleSymbolState(char);
//           break;
//         case STATE_TYPE.KEYWORD_AND_IDENTIFIER:
//           state = this.handleKeywordAndIdentifierState(char);
//           break;
//       }
//     }
//   }
//   handleInitialState(currentChar: String): STATE_TYPE {
//     let state: STATE_TYPE = STATE_TYPE.INITIAL;
//     this.currentToken = "";
//     if (this.isNumber(currentChar)) {
//       state = STATE_TYPE.INT_CONST;
//     } else if (this.isLetter(currentChar)) {
//       this.currentToken = currentChar;
//       state = STATE_TYPE.KEYWORD_AND_IDENTIFIER;
//     } else if (this.isQuote(currentChar)) {
//       state = STATE_TYPE.STRING_CONST;
//     } else if (this.isSymbol(currentChar)) {
//       state = STATE_TYPE.SYMBOL;
//     }
//     return state;
//   }
//   isSpace(currentChar) {
//     return (currentChar = " ");
//   }
//   isQuote(currentChar) {
//     return currentChar == '"';
//   }
//   isLetter(currentChar) {
//     return LETTER_REGEX.test(currentChar);
//   }
//   isNumber(currentChar) {
//     return NUMBER_REGEX.test(currentChar);
//   }
//   isSymbol(currentChar) {
//     return SYMBOL_REGEX.test(currentChar);
//   }
//   handleIntConstState(currentChar: String): STATE_TYPE {
//     return STATE_TYPE.INT_CONST;
//   }
//   handleStringConstState(currentChar: String): STATE_TYPE {
//     return STATE_TYPE.STRING_CONST;
//   }
//   handleSymbolState(currentChar: String): STATE_TYPE {
//     let state: STATE_TYPE = STATE_TYPE.SYMBOL;
//     if (this.isSpace(currentChar)) {
//       this.tokens.push(this.currentToken);
//       state = STATE_TYPE.INITIAL;
//     } else if (this.isSymbol(currentChar)) {
//       this.currentToken = `${this.currentToken}${currentChar}`;
//     }
//     return STATE_TYPE.SYMBOL;
//   }
//   handleKeywordAndIdentifierState(currentChar: String): STATE_TYPE {
//     let state: STATE_TYPE = STATE_TYPE.KEYWORD_AND_IDENTIFIER;
//     if (this.isSpace(currentChar)) {
//       state = STATE_TYPE.INITIAL;
//       this.tokens.push(this.currentToken);
//     } else if (this.isSymbol(currentChar)) {
//       this.tokens.push(this.currentToken);
//       this.currentToken = currentChar;
//       state = STATE_TYPE.SYMBOL;
//     } else {
//       this.currentToken = `${this.currentToken}${currentChar}`;
//     }
//     return state;
//   }
//   removeComment() {
//     this.data = this.data.replace(REMOVE_COMMENT, "").trim();
//   }
//   preprocess() {
//     const splitCommands = this.data.split("\n");
//     const instructions = splitCommands.filter(instruction => {
//       return instruction.trim().length > 0;
//     });
//     return this.trimCommands(instructions);
//   }
//   trimCommands(instructions: string[]) {
//     let sanitizedCommands = instructions.map(vmCommand => {
//       return vmCommand.trim();
//     });
//     return sanitizedCommands;
//   }
//   normalizeData(instructions: String[]) {
//     let normData = "";
//     instructions.forEach(instruction => {
//       normData += `${instruction}\n`;
//     });
//     this.normData = normData;
//   }
//   hasMoreTokens(): boolean {
//     return true;
//   }
//   advance() {}
//   tokenType(): TOKEN_TYPES {
//     return TOKEN_TYPES.IDENTIFIER;
//   }
//   keyword(): KEYWORDS {
//     return KEYWORDS.BOOLEAN;
//   }
//   symbol(): String {
//     if (this.tokenType() == TOKEN_TYPES.SYMBOL) {
//       return "}";
//     }
//   }
//   identifier(): String {
//     if (this.tokenType() == TOKEN_TYPES.IDENTIFIER) {
//       return "I am an identifier";
//     }
//   }
//   intVal(): number {
//     if (this.tokenType() == TOKEN_TYPES.INT_CONST) {
//       return 1;
//     }
//   }
//   stringVal(): String {
//     if (this.tokenType() == TOKEN_TYPES.STRING_CONST) {
//       return "I am a literal string";
//     }
//   }
// }
// const tokenizer = new Tokenizer("../tokenizer.ts");
