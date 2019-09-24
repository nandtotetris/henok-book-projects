"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tokenizer_1 = require("./tokenizer");
function error(message, title) {
    if (title === void 0) { title = "Expected"; }
    throw new Error(title + " " + message);
}
var ops = ["+", "-", "*", "/", "&", "|", "<", ">", "="];
var unaryOps = ["-", "~"];
var CompilationEngine = /** @class */ (function () {
    function CompilationEngine(inputFile) {
        this.data = "";
        this.inputFile = "";
        this.tokenizer = new tokenizer_1.default(inputFile);
        this.inputFile = inputFile;
    }
    CompilationEngine.prototype.getData = function () {
        return this.data;
    };
    CompilationEngine.prototype.compileClass = function () {
        this.tokenizer.advance();
        if (this.assertNotToken(tokenizer_1.TOKEN_TYPES.KEYWORD, this.getKeyWord(tokenizer_1.KEYWORDS.CLASS))) {
            error(' keyword "class"');
        }
        this.data += "<class>\n";
        this.data += this.getKeywordXml();
        this.tokenizer.advance();
        if (this.tokenizer.tokenType() !== tokenizer_1.TOKEN_TYPES.IDENTIFIER) {
            error(" identifier");
        }
        this.data += this.getIdentifierXml();
        this.tokenizer.advance();
        if (this.assertNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, "{")) {
            error(' "{" in class declaration');
        }
        this.data += this.getSymbolXml();
        this.compileClassVarDec();
        this.compileSubroutine();
        this.tokenizer.advance();
        if (this.assertNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, "}")) {
            error(' "}" in class declaration');
        }
        this.data += this.getSymbolXml();
        this.data += "</class>";
        if (this.tokenizer.hasMoreTokens()) {
            error("tokens", "Unexpected");
        }
    };
    CompilationEngine.prototype.assertTokenArray = function (type, symbols) {
        var _this = this;
        var result = false;
        symbols.forEach(function (symbol) {
            if (result === true)
                symbols.length == 0;
            result = result || _this.assertToken(type, symbol);
        });
        return result;
    };
    CompilationEngine.prototype.assertNotTokenArray = function (type, symbols) {
        var _this = this;
        var result = true;
        symbols.forEach(function (symbol) {
            if (result === false)
                symbols.length == 0;
            result = result && _this.assertNotToken(type, symbol);
        });
        return result;
    };
    CompilationEngine.prototype.assertToken = function (type, symbol) {
        var isTrue = false;
        if (this.tokenizer.getCurrentToken() === symbol &&
            this.tokenizer.tokenType() === type) {
            isTrue = true;
        }
        return isTrue;
    };
    CompilationEngine.prototype.assertNotToken = function (type, symbol) {
        return !this.assertToken(type, symbol);
    };
    CompilationEngine.prototype.errorNotToken = function (type, symbol, message) {
        if (this.assertNotToken(type, symbol)) {
            error(message);
        }
    };
    CompilationEngine.prototype.assertTokenType = function (type) {
        return this.tokenizer.tokenType() === type;
    };
    CompilationEngine.prototype.assertNotTokenType = function (type) {
        return !this.assertTokenType(type);
    };
    CompilationEngine.prototype.errorNotTokenType = function (type, message) {
        if (this.assertNotTokenType(type)) {
            error(message);
        }
    };
    CompilationEngine.prototype.errorNotOp = function (message) {
        if (!this.isOp())
            error(message);
    };
    CompilationEngine.prototype.assertNotTokenTypeArray = function (types) {
        var _this = this;
        var result = false;
        types.forEach(function (type) {
            if (result === true)
                types.length == 0;
            result = result || _this.assertNotTokenType(type);
        });
        return result;
    };
    CompilationEngine.prototype.getKeyWord = function (code) {
        return tokenizer_1.KEYWORDS[code].toLowerCase();
    };
    CompilationEngine.prototype.compileClassVarDec = function () {
        this.tokenizer.advance();
        if (this.assertToken(tokenizer_1.TOKEN_TYPES.SYMBOL, "}")) {
            this.tokenizer.back();
            return;
        }
        if (this.assertNotTokenType(tokenizer_1.TOKEN_TYPES.KEYWORD)) {
            error(' a "keyword"');
        }
        if (this.assertTokenArray(tokenizer_1.TOKEN_TYPES.KEYWORD, [
            this.getKeyWord(tokenizer_1.KEYWORDS.CONSTRUCTOR),
            this.getKeyWord(tokenizer_1.KEYWORDS.FUNCTION),
            this.getKeyWord(tokenizer_1.KEYWORDS.METHOD)
        ])) {
            this.tokenizer.back();
            return;
        }
        if (this.assertNotToken(tokenizer_1.TOKEN_TYPES.KEYWORD, this.getKeyWord(tokenizer_1.KEYWORDS.STATIC)) &&
            this.assertNotToken(tokenizer_1.TOKEN_TYPES.KEYWORD, this.getKeyWord(tokenizer_1.KEYWORDS.FIELD))) {
            error(" static | field in class variable decalarations");
        }
        this.data += "<classVarDec>\n";
        this.data += this.getKeywordXml();
        this.compileType();
        while (true) {
            this.tokenizer.advance();
            if (this.assertNotTokenType(tokenizer_1.TOKEN_TYPES.IDENTIFIER)) {
                error(' "Identifier"');
            }
            this.data += this.getIdentifierXml();
            this.tokenizer.advance();
            if (this.assertToken(tokenizer_1.TOKEN_TYPES.SYMBOL, ",")) {
                this.data += this.getSymbolXml();
            }
            else if (this.assertToken(tokenizer_1.TOKEN_TYPES.SYMBOL, ";")) {
                this.data += this.getSymbolXml();
                break;
            }
            else {
                error('";" | "," ');
            }
        }
        this.data += "</classVarDec>\n";
        this.compileClassVarDec();
    };
    CompilationEngine.prototype.compileType = function () {
        this.tokenizer.advance();
        if (this.assertTokenArray(tokenizer_1.TOKEN_TYPES.KEYWORD, [
            this.getKeyWord(tokenizer_1.KEYWORDS.BOOLEAN),
            this.getKeyWord(tokenizer_1.KEYWORDS.CHAR),
            this.getKeyWord(tokenizer_1.KEYWORDS.INT)
        ])) {
            this.data += this.getKeywordXml();
        }
        else if (this.assertTokenType(tokenizer_1.TOKEN_TYPES.IDENTIFIER)) {
            this.data += this.getIdentifierXml();
        }
        else {
            error(' "int" | "char" | "boolean" | "className" for return type');
        }
    };
    CompilationEngine.prototype.getNonterminalXml = function (type, data) {
        if (data === void 0) { data = this.tokenizer.getCurrentToken(); }
        return "<" + type + "> " + data + " </" + type + ">\n";
    };
    CompilationEngine.prototype.getSymbolXml = function () {
        return this.getNonterminalXml("symbol");
    };
    CompilationEngine.prototype.getIdentifierXml = function () {
        return this.getNonterminalXml("identifier");
    };
    CompilationEngine.prototype.getKeywordXml = function () {
        return this.getNonterminalXml("keyword");
    };
    CompilationEngine.prototype.getIntConstXml = function () {
        return this.getNonterminalXml("integerConstant");
    };
    CompilationEngine.prototype.getStringConstXml = function () {
        return this.getNonterminalXml("stringConstant", this.tokenizer.getCurrentToken().replace(/"/g, ""));
    };
    CompilationEngine.prototype.compileSubroutine = function () {
        this.tokenizer.advance();
        if (this.assertToken(tokenizer_1.TOKEN_TYPES.SYMBOL, "}")) {
            this.tokenizer.back();
            return;
        }
        var constructor = this.getKeyWord(tokenizer_1.KEYWORDS.CONSTRUCTOR);
        var myFunction = this.getKeyWord(tokenizer_1.KEYWORDS.FUNCTION);
        var method = this.getKeyWord(tokenizer_1.KEYWORDS.METHOD);
        if (this.assertNotTokenArray(tokenizer_1.TOKEN_TYPES.KEYWORD, [
            constructor,
            myFunction,
            method
        ])) {
            error(' "constructor" | "function" | "method"');
        }
        this.data += "<subroutineDec>\n";
        this.data += this.getKeywordXml();
        this.tokenizer.advance();
        if (this.assertToken(tokenizer_1.TOKEN_TYPES.KEYWORD, this.getKeyWord(tokenizer_1.KEYWORDS.VOID))) {
            this.data += this.getKeywordXml();
        }
        else if (this.assertTokenType(tokenizer_1.TOKEN_TYPES.IDENTIFIER)) {
            this.data += this.getIdentifierXml();
        }
        else {
            error(' "void" or "Identifier"');
        }
        this.tokenizer.advance();
        if (this.assertNotTokenType(tokenizer_1.TOKEN_TYPES.IDENTIFIER)) {
            error(' "Identifier"');
        }
        this.data += this.getIdentifierXml();
        this.tokenizer.advance();
        if (this.assertNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, "(")) {
            error(' "("');
        }
        this.data += this.getSymbolXml();
        this.compileParameterList();
        this.tokenizer.advance();
        this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, ")", ' ")"');
        this.data += this.getSymbolXml();
        this.compileSubroutineBody();
        this.data += "</subroutineDec>\n";
        this.compileSubroutine();
    };
    CompilationEngine.prototype.compileParameterList = function () {
        this.data += "<parameterList>\n";
        this.tokenizer.advance();
        if (this.assertToken(tokenizer_1.TOKEN_TYPES.SYMBOL, ")")) {
            this.data += "</parameterList>\n";
            this.tokenizer.back();
            return;
        }
        this.tokenizer.back();
        while (true) {
            this.compileType();
            this.tokenizer.advance();
            if (this.assertNotTokenType(tokenizer_1.TOKEN_TYPES.IDENTIFIER)) {
                error(' "Identifier"');
            }
            this.data += this.getIdentifierXml();
            this.tokenizer.advance();
            if (this.assertToken(tokenizer_1.TOKEN_TYPES.SYMBOL, ",")) {
                this.data += this.getSymbolXml();
            }
            else if (this.assertToken(tokenizer_1.TOKEN_TYPES.SYMBOL, ")")) {
                this.tokenizer.back();
                break;
            }
            else {
                error(' "," | ")"');
            }
        }
        this.data += "</parameterList>\n";
    };
    CompilationEngine.prototype.compileSubroutineBody = function () {
        this.tokenizer.advance();
        this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, "{", ' "}" in subroutine declaration');
        this.data += "<subroutineBody>\n";
        this.data += this.getSymbolXml();
        this.compileVarDec();
        this.data += "<statements>\n";
        this.compileStatement();
        this.data += "</statements>\n";
        this.tokenizer.advance();
        this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, "}", '"}" in subroutine declaration');
        this.data += this.getSymbolXml();
        this.data += "</subroutineBody>\n";
    };
    CompilationEngine.prototype.compileVarDec = function () {
        this.tokenizer.advance();
        if (this.assertNotToken(tokenizer_1.TOKEN_TYPES.KEYWORD, this.getKeyWord(tokenizer_1.KEYWORDS.VAR))) {
            this.tokenizer.back();
            return;
        }
        this.data += "<varDec>\n";
        this.data += this.getKeywordXml();
        this.compileType();
        while (true) {
            this.tokenizer.advance();
            this.errorNotTokenType(tokenizer_1.TOKEN_TYPES.IDENTIFIER, "Identifier in variable declaration");
            this.data += this.getIdentifierXml();
            this.tokenizer.advance();
            if (this.assertToken(tokenizer_1.TOKEN_TYPES.SYMBOL, ",")) {
                this.data += this.getSymbolXml();
            }
            else if (this.assertToken(tokenizer_1.TOKEN_TYPES.SYMBOL, ";")) {
                this.data += this.getSymbolXml();
                break;
            }
            else {
                error('"," | ";" in variable declaration');
            }
        }
        this.data += "</varDec>\n";
        this.compileVarDec();
    };
    CompilationEngine.prototype.compileStatement = function () {
        this.tokenizer.advance();
        if (this.assertToken(tokenizer_1.TOKEN_TYPES.SYMBOL, "}")) {
            this.tokenizer.back();
            return;
        }
        var mLet = this.getKeyWord(tokenizer_1.KEYWORDS.LET);
        var mIf = this.getKeyWord(tokenizer_1.KEYWORDS.IF);
        var mWhile = this.getKeyWord(tokenizer_1.KEYWORDS.WHILE);
        var mDo = this.getKeyWord(tokenizer_1.KEYWORDS.DO);
        var mReturn = this.getKeyWord(tokenizer_1.KEYWORDS.RETURN);
        this.errorNotTokenType(tokenizer_1.TOKEN_TYPES.KEYWORD, '"a keyword"');
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
    };
    CompilationEngine.prototype.compileSubroutineCall = function () {
        this.tokenizer.advance();
        this.errorNotTokenType(tokenizer_1.TOKEN_TYPES.IDENTIFIER, '"Identifier"');
        this.data += this.getIdentifierXml();
        this.tokenizer.advance();
        if (this.assertToken(tokenizer_1.TOKEN_TYPES.SYMBOL, ".")) {
            this.data += this.getSymbolXml();
            this.tokenizer.advance();
            this.errorNotTokenType(tokenizer_1.TOKEN_TYPES.IDENTIFIER, '"Identifier"');
            this.data += this.getIdentifierXml();
        }
        else {
            this.tokenizer.back();
        }
        this.tokenizer.advance();
        this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, "(", "(");
        this.data += this.getSymbolXml();
        this.compileExpressionList();
        this.tokenizer.advance();
        this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, ")", ")");
        this.data += this.getSymbolXml();
    };
    CompilationEngine.prototype.compileDo = function () {
        this.data += "<doStatement>\n";
        this.data += this.getKeywordXml();
        this.compileSubroutineCall();
        this.tokenizer.advance();
        this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, ";", ";");
        this.data += this.getSymbolXml();
        this.data += "</doStatement>\n";
    };
    CompilationEngine.prototype.compileLet = function () {
        this.data += "<letStatement>\n";
        this.data += this.getKeywordXml();
        this.tokenizer.advance();
        this.errorNotTokenType(tokenizer_1.TOKEN_TYPES.IDENTIFIER, "Identifier");
        this.data += this.getIdentifierXml();
        this.tokenizer.advance();
        if (this.assertToken(tokenizer_1.TOKEN_TYPES.SYMBOL, "[")) {
            this.data += this.getSymbolXml();
            this.compileExpression();
            this.tokenizer.advance();
            this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, "]", "]");
            this.data += this.getSymbolXml();
        }
        else {
            this.tokenizer.back();
        }
        this.tokenizer.advance();
        this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, "=", '"="');
        this.data += this.getSymbolXml();
        this.compileExpression();
        this.tokenizer.advance();
        this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, ";", '";"');
        this.data += this.getSymbolXml();
        this.data += "</letStatement>\n";
    };
    CompilationEngine.prototype.compileWhile = function () {
        this.data += "<whileStatement>\n";
        this.data += this.getKeywordXml();
        this.tokenizer.advance();
        this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, "(", '"("');
        this.data += this.getSymbolXml();
        this.compileExpression();
        this.tokenizer.advance();
        this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, ")", '")"');
        this.data += this.getSymbolXml();
        this.tokenizer.advance();
        this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, "{", '"{"');
        this.data += this.getSymbolXml();
        this.data += "<statements>\n";
        this.compileStatement();
        this.data += "</statements>\n";
        this.tokenizer.advance();
        this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, "}", '"}"');
        this.data += this.getSymbolXml();
        this.data += "</whileStatement>\n";
    };
    CompilationEngine.prototype.compileReturn = function () {
        this.data += "<returnStatement>\n";
        this.data += this.getKeywordXml();
        this.tokenizer.advance();
        if (this.assertToken(tokenizer_1.TOKEN_TYPES.SYMBOL, ";")) {
            this.tokenizer.back();
        }
        else {
            this.tokenizer.back();
            this.compileExpression();
        }
        this.tokenizer.advance();
        this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, ";", '";"');
        this.data += this.getSymbolXml();
        this.data += "</returnStatement>\n";
    };
    CompilationEngine.prototype.compileIf = function () {
        this.data += "<ifStatement>\n";
        this.data += this.getKeywordXml();
        this.tokenizer.advance();
        this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, "(", '"("');
        this.data += this.getSymbolXml();
        this.compileExpression();
        this.tokenizer.advance();
        this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, ")", '")"');
        this.data += this.getSymbolXml();
        this.tokenizer.advance();
        this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, "{", '"{"');
        this.data += this.getSymbolXml();
        this.data += "<statements>\n";
        this.compileStatement();
        this.data += "</statements>\n";
        this.tokenizer.advance();
        this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, "}", '"}"');
        this.data += this.getSymbolXml();
        this.tokenizer.advance();
        if (this.assertToken(tokenizer_1.TOKEN_TYPES.KEYWORD, this.getKeyWord(tokenizer_1.KEYWORDS.ELSE))) {
            this.data += this.getKeywordXml();
            this.tokenizer.advance();
            this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, "{", '"{"');
            this.data += this.getSymbolXml();
            this.data += "<statements>\n";
            this.compileStatement();
            this.data += "</statements>\n";
            this.tokenizer.advance();
            this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, "}", '"}"');
            this.data += this.getSymbolXml();
        }
        else {
            this.tokenizer.back();
        }
        this.data += "</ifStatement>\n";
    };
    CompilationEngine.prototype.compileExpression = function () {
        this.data += "<expression>\n";
        this.compileTerm();
        while (true) {
            this.tokenizer.advance();
            if (this.assertTokenArray(tokenizer_1.TOKEN_TYPES.SYMBOL, [";", "]", ")", ","])) {
                this.tokenizer.back();
                break;
            }
            this.errorNotOp((function () {
                var message = "";
                for (var i = 0; i < ops.length; i++) {
                    message += ops[i] + " " + (i == ops.length - 1 ? "" : " | ");
                }
                return message;
            })());
            if ([">", "<", "&"].indexOf(this.tokenizer.getCurrentToken()) !== -1) {
                this.data += this.getNonterminalXml("symbol", this.convertSpeciallChars(this.tokenizer.getCurrentToken()));
            }
            else {
                this.data += this.getSymbolXml();
            }
            this.compileTerm();
        }
        this.data += "</expression>\n";
    };
    CompilationEngine.prototype.compileTerm = function () {
        this.data += "<term>\n";
        this.tokenizer.advance();
        var isNotIdentifier = this.assertNotTokenType(tokenizer_1.TOKEN_TYPES.IDENTIFIER);
        var isKeyConst = this.isKeywordConstant();
        var isNotIntConst = this.assertNotTokenType(tokenizer_1.TOKEN_TYPES.INT_CONST);
        var isNotStringConst = this.assertNotTokenType(tokenizer_1.TOKEN_TYPES.STRING_CONST);
        var isUnaryOp = this.isUnaryOp();
        var isArrary = this.isArrayCommand();
        var isGroup = this.isGrouping();
        var isSubroutCall = this.isSubroutineCall();
        if (isNotIdentifier &&
            !isKeyConst &&
            isNotIntConst &&
            isNotStringConst &&
            !isUnaryOp &&
            !isArrary &&
            !isGroup &&
            !isSubroutCall) {
            error('"Identifier" | "this" | "true" | "false" | "null" | "integerConstant" | \
        "stringConstant" | "-" | "~" | "[]" | "()" | "x()" || "x.y()"');
        }
        var isIdentifier = !isNotIdentifier;
        var isIntConst = !isNotIntConst;
        var isStringConst = !isNotStringConst;
        if (isArrary) {
            this.data += this.getIdentifierXml();
            this.tokenizer.advance();
            this.data += this.getSymbolXml();
            this.compileExpression();
            this.tokenizer.advance();
            this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, "]", "]");
            this.data += this.getSymbolXml();
        }
        else if (isSubroutCall) {
            this.tokenizer.back();
            this.compileSubroutineCall();
        }
        else if (isGroup) {
            this.data += this.getSymbolXml();
            this.compileExpression();
            this.tokenizer.advance();
            this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, ")", ")");
            this.data += this.getSymbolXml();
        }
        else if (isKeyConst) {
            this.data += this.getKeywordXml();
        }
        else if (isIntConst) {
            this.data += this.getIntConstXml();
        }
        else if (isStringConst) {
            this.data += this.getStringConstXml();
        }
        else if (isUnaryOp) {
            this.data += this.getSymbolXml();
            this.compileTerm();
        }
        else if (isIdentifier) {
            this.data += this.getIdentifierXml();
        }
        this.data += "</term>\n";
    };
    CompilationEngine.prototype.convertSpeciallChars = function (token) {
        var symbol = "";
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
    };
    CompilationEngine.prototype.isGrouping = function () {
        return this.assertToken(tokenizer_1.TOKEN_TYPES.SYMBOL, "(");
    };
    CompilationEngine.prototype.checkIdentfierThenCall = function () {
        var result = false;
        if (this.assertTokenType(tokenizer_1.TOKEN_TYPES.IDENTIFIER)) {
            this.tokenizer.advance();
            if (this.assertToken(tokenizer_1.TOKEN_TYPES.SYMBOL, "(")) {
                result = true;
            }
            this.tokenizer.back();
        }
        return result;
    };
    CompilationEngine.prototype.isSubroutineCall = function () {
        var result = false;
        if (this.checkIdentfierThenCall())
            result = true;
        if (this.assertTokenType(tokenizer_1.TOKEN_TYPES.IDENTIFIER)) {
            this.tokenizer.advance();
            if (this.assertToken(tokenizer_1.TOKEN_TYPES.SYMBOL, ".")) {
                this.tokenizer.advance();
                if (this.checkIdentfierThenCall())
                    result = true;
                this.tokenizer.back();
            }
            this.tokenizer.back();
        }
        return result;
    };
    CompilationEngine.prototype.isArrayCommand = function () {
        var result = false;
        if (this.assertTokenType(tokenizer_1.TOKEN_TYPES.IDENTIFIER)) {
            this.tokenizer.advance();
            if (this.assertToken(tokenizer_1.TOKEN_TYPES.SYMBOL, "[")) {
                result = true;
            }
            this.tokenizer.back();
        }
        return result;
    };
    CompilationEngine.prototype.compileExpressionList = function () {
        this.data += "<expressionList>\n";
        this.tokenizer.advance();
        if (this.assertToken(tokenizer_1.TOKEN_TYPES.SYMBOL, ")")) {
            this.data += "</expressionList>\n";
            this.tokenizer.back();
            return;
        }
        this.tokenizer.back();
        while (true) {
            this.compileExpression();
            this.tokenizer.advance();
            if (this.assertToken(tokenizer_1.TOKEN_TYPES.SYMBOL, ",")) {
                this.data += this.getSymbolXml();
            }
            else if (this.assertToken(tokenizer_1.TOKEN_TYPES.SYMBOL, ")")) {
                this.tokenizer.back();
                break;
            }
            else {
                error('"," | ")"');
            }
        }
        this.data += "</expressionList>\n";
    };
    CompilationEngine.prototype.isOp = function () {
        var currentToken = this.tokenizer.getCurrentToken();
        return ops.indexOf(currentToken) !== -1;
    };
    CompilationEngine.prototype.isUnaryOp = function () {
        var currentToken = this.tokenizer.getCurrentToken();
        return unaryOps.indexOf(currentToken) !== -1;
    };
    CompilationEngine.prototype.isKeywordConstant = function () {
        var currentToken = this.tokenizer.getCurrentToken();
        var mThis = this.getKeyWord(tokenizer_1.KEYWORDS.THIS);
        var mTrue = this.getKeyWord(tokenizer_1.KEYWORDS.TRUE);
        var mFalse = this.getKeyWord(tokenizer_1.KEYWORDS.FALSE);
        var mNull = this.getKeyWord(tokenizer_1.KEYWORDS.NULL);
        return (currentToken == mThis ||
            currentToken == mTrue ||
            currentToken == mFalse ||
            currentToken == mNull);
    };
    return CompilationEngine;
}());
exports.default = CompilationEngine;
