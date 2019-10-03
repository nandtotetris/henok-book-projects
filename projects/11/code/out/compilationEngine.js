"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tokenizer_1 = require("./tokenizer");
var symbolTable_1 = require("./symbolTable");
var VMWriter_1 = require("./VMWriter");
function error(message, title) {
    if (title === void 0) { title = "Expected"; }
    throw new Error(title + " " + message);
}
var IF_TRUE = "IF_TRUE";
var IF_FALSE = "IF_FALSE";
var IF_END = "IF_END";
var WHILE_EXP = "WHILE_EXP";
var WHILE_END = "WHILE_END";
var ops = ["+", "-", "*", "/", "&", "|", "<", ">", "="];
var unaryOps = ["-", "~"];
var CompilationEngine = /** @class */ (function () {
    // private data: string = "";
    function CompilationEngine(inputFile) {
        this.labelIndex = -1;
        this.whileIndex = -1;
        this.tokenizer = new tokenizer_1.default(inputFile);
        this.vmWritter = new VMWriter_1.default("");
        this.symTable = new symbolTable_1.default();
    }
    CompilationEngine.prototype.getIfTrue = function (index) {
        return "" + IF_TRUE + index;
    };
    CompilationEngine.prototype.getIfFalse = function (index) {
        return "" + IF_FALSE + index;
    };
    CompilationEngine.prototype.getIfEnd = function (index) {
        return "" + IF_END + index;
    };
    CompilationEngine.prototype.getWhileExp = function (index) {
        return "" + WHILE_EXP + index;
    };
    CompilationEngine.prototype.getWhileEnd = function (index) {
        return "" + WHILE_END + index;
    };
    CompilationEngine.prototype.getLabel = function (index) {
        return "L" + index;
    };
    CompilationEngine.prototype.incLabelIndex = function () {
        this.labelIndex += 1;
    };
    CompilationEngine.prototype.getSymData = function () {
        this.symTable.log();
    };
    CompilationEngine.prototype.getVMData = function () {
        return this.vmWritter.getData();
    };
    CompilationEngine.prototype.compileClass = function () {
        this.tokenizer.advance();
        if (this.assertNotToken(tokenizer_1.TOKEN_TYPES.KEYWORD, this.getKeyWord(tokenizer_1.KEYWORDS.CLASS))) {
            error('keyword "class"');
        }
        this.tokenizer.advance();
        if (this.tokenizer.tokenType() !== tokenizer_1.TOKEN_TYPES.IDENTIFIER) {
            error("identifier");
        }
        this.currentClassName = this.tokenizer.getCurrentToken();
        this.tokenizer.advance();
        if (this.assertNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, "{")) {
            error(' "{" in class declaration');
        }
        this.compileClassVarDec();
        this.compileSubroutine();
        this.tokenizer.advance();
        if (this.assertNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, "}")) {
            error(' "}" in class declaration');
        }
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
            error('a "keyword"');
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
        var kind;
        switch (this.tokenizer.getCurrentToken()) {
            case this.getKeyWord(tokenizer_1.KEYWORDS.FIELD):
                kind = symbolTable_1.KINDS.FIELD;
                break;
            case this.getKeyWord(tokenizer_1.KEYWORDS.STATIC):
                kind = symbolTable_1.KINDS.STATIC;
                break;
        }
        var type = this.compileType();
        while (true) {
            this.tokenizer.advance();
            if (this.assertNotTokenType(tokenizer_1.TOKEN_TYPES.IDENTIFIER)) {
                error(' "Identifier"');
            }
            this.symTable.define(this.tokenizer.getCurrentToken(), type, kind);
            this.tokenizer.advance();
            if (this.assertToken(tokenizer_1.TOKEN_TYPES.SYMBOL, ",")) {
            }
            else if (this.assertToken(tokenizer_1.TOKEN_TYPES.SYMBOL, ";")) {
                break;
            }
            else {
                error('";" | "," ');
            }
        }
        this.compileClassVarDec();
    };
    CompilationEngine.prototype.compileType = function () {
        var type = "";
        this.tokenizer.advance();
        if (this.assertTokenArray(tokenizer_1.TOKEN_TYPES.KEYWORD, [
            this.getKeyWord(tokenizer_1.KEYWORDS.BOOLEAN),
            this.getKeyWord(tokenizer_1.KEYWORDS.CHAR),
            this.getKeyWord(tokenizer_1.KEYWORDS.INT)
        ])) {
            type = this.tokenizer.keyword();
        }
        else if (this.assertTokenType(tokenizer_1.TOKEN_TYPES.IDENTIFIER)) {
            type = this.tokenizer.identifier();
        }
        else {
            error('"int" | "char" | "boolean" | "className" for return type');
        }
        return type;
    };
    CompilationEngine.prototype.getTerminalXml = function (type, data, extra) {
        if (data === void 0) { data = this.tokenizer.getCurrentToken(); }
        if (extra === void 0) { extra = ""; }
        return "<" + type + " " + extra + "> " + data + " </" + type + ">\n";
    };
    CompilationEngine.prototype.getSymbolXml = function () {
        return this.getTerminalXml("symbol");
    };
    CompilationEngine.prototype.getIdentifierXml = function (category, isBeingDefined, kind, index) {
        if (category === void 0) { category = ""; }
        if (isBeingDefined === void 0) { isBeingDefined = false; }
        if (kind === void 0) { kind = 1; }
        if (index === void 0) { index = -1; }
        return this.getTerminalXml("identifier");
    };
    CompilationEngine.prototype.getKeywordXml = function () {
        return this.getTerminalXml("keyword");
    };
    CompilationEngine.prototype.getIntConstXml = function () {
        return this.getTerminalXml("integerConstant");
    };
    CompilationEngine.prototype.getStringConstXml = function () {
        return this.getTerminalXml("stringConstant", this.tokenizer.getCurrentToken().replace(/"/g, ""));
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
            error('"constructor" | "function" | "method"');
        }
        var keyword = this.tokenizer.keyword();
        this.symTable.startSubroutine();
        this.tokenizer.advance();
        if (this.assertToken(tokenizer_1.TOKEN_TYPES.KEYWORD, this.getKeyWord(tokenizer_1.KEYWORDS.VOID))) {
        }
        else {
            this.tokenizer.back();
            this.compileType();
        }
        this.tokenizer.advance();
        if (this.assertNotTokenType(tokenizer_1.TOKEN_TYPES.IDENTIFIER)) {
            error('"Identifier"');
        }
        this.currentFunctionName = this.tokenizer.getCurrentToken();
        this.tokenizer.advance();
        if (this.assertNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, "(")) {
            error(' "("');
        }
        if (keyword === this.getKeyWord(tokenizer_1.KEYWORDS.METHOD)) {
            this.symTable.define("this", this.currentClassName, symbolTable_1.KINDS.ARG);
        }
        this.compileParameterList();
        this.tokenizer.advance();
        this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, ")", ' ")"');
        this.compileSubroutineBody(keyword);
        this.compileSubroutine();
    };
    CompilationEngine.prototype.compileParameterList = function () {
        this.tokenizer.advance();
        if (this.assertToken(tokenizer_1.TOKEN_TYPES.SYMBOL, ")")) {
            this.tokenizer.back();
            return;
        }
        this.tokenizer.back();
        while (true) {
            var type = this.compileType();
            this.tokenizer.advance();
            if (this.assertNotTokenType(tokenizer_1.TOKEN_TYPES.IDENTIFIER)) {
                error('"Identifier"');
            }
            var identifier = this.tokenizer.identifier();
            this.symTable.define(identifier, type, symbolTable_1.KINDS.ARG);
            this.tokenizer.advance();
            if (this.assertToken(tokenizer_1.TOKEN_TYPES.SYMBOL, ",")) {
            }
            else if (this.assertToken(tokenizer_1.TOKEN_TYPES.SYMBOL, ")")) {
                this.tokenizer.back();
                break;
            }
            else {
                error(' "," | ")"');
            }
        }
    };
    CompilationEngine.prototype.compileSubroutineBody = function (subroutineType) {
        this.tokenizer.advance();
        this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, "{", ' "{" in subroutine declaration');
        this.compileVarDec();
        this.vmWritter.writeFunction(this.currentClassName + "." + this.currentFunctionName, this.symTable.varCount(symbolTable_1.KINDS.VAR));
        switch (subroutineType) {
            case this.getKeyWord(tokenizer_1.KEYWORDS.METHOD):
                this.vmWritter.writePush(VMWriter_1.SEGMENTS.ARG, 0);
                this.vmWritter.writePop(VMWriter_1.SEGMENTS.POINTER, 0);
                break;
            case this.getKeyWord(tokenizer_1.KEYWORDS.CONSTRUCTOR):
                var numberOfFields = this.symTable.varCount(symbolTable_1.KINDS.FIELD);
                this.vmWritter.writePush(VMWriter_1.SEGMENTS.CONSTANT, numberOfFields);
                this.vmWritter.writeCommand("call Memory.alloc 1");
                this.vmWritter.writePop(VMWriter_1.SEGMENTS.POINTER, 0);
        }
        this.compileStatement();
        this.tokenizer.advance();
        this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, "}", '"}" in subroutine declaration');
    };
    CompilationEngine.prototype.compileVarDec = function () {
        this.tokenizer.advance();
        if (this.assertNotToken(tokenizer_1.TOKEN_TYPES.KEYWORD, this.getKeyWord(tokenizer_1.KEYWORDS.VAR))) {
            this.tokenizer.back();
            return;
        }
        var type = this.compileType();
        while (true) {
            this.tokenizer.advance();
            this.errorNotTokenType(tokenizer_1.TOKEN_TYPES.IDENTIFIER, "Identifier in variable declaration");
            this.symTable.define(this.tokenizer.getCurrentToken(), type, symbolTable_1.KINDS.VAR);
            this.tokenizer.advance();
            if (this.assertToken(tokenizer_1.TOKEN_TYPES.SYMBOL, ",")) {
            }
            else if (this.assertToken(tokenizer_1.TOKEN_TYPES.SYMBOL, ";")) {
                break;
            }
            else {
                error('"," | ";" in variable declaration');
            }
        }
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
        var identifier = "";
        var numberOfArguments = 0;
        this.tokenizer.advance();
        this.errorNotTokenType(tokenizer_1.TOKEN_TYPES.IDENTIFIER, '"Identifier"');
        identifier = this.tokenizer.getCurrentToken();
        var isMethodCall = false;
        this.tokenizer.advance();
        if (this.assertToken(tokenizer_1.TOKEN_TYPES.SYMBOL, ".")) {
            var objectName = identifier;
            this.tokenizer.advance();
            this.errorNotTokenType(tokenizer_1.TOKEN_TYPES.IDENTIFIER, '"Identifier"');
            var functionName = this.tokenizer.getCurrentToken();
            if (this.symTable.kindOf(objectName) !== symbolTable_1.ALL_KINDS.NONE) {
                var type = this.symTable.typeOf(objectName);
                isMethodCall = true;
                this.vmWritter.writePush(this.convertKindToSegment(this.symTable.kindOf(objectName)), this.symTable.indexOf(objectName));
                identifier = type + "." + functionName;
            }
            else {
                identifier += "." + functionName;
            }
        }
        else {
            isMethodCall = true;
            this.vmWritter.writePush(VMWriter_1.SEGMENTS.POINTER, 0);
            identifier = this.currentClassName + "." + identifier;
            this.tokenizer.back();
        }
        this.tokenizer.advance();
        this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, "(", "(");
        numberOfArguments = this.compileExpressionList();
        if (isMethodCall) {
            numberOfArguments += 1;
        }
        this.tokenizer.advance();
        this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, ")", ")");
        this.vmWritter.writeCall(identifier, numberOfArguments);
    };
    CompilationEngine.prototype.compileDo = function () {
        this.compileSubroutineCall();
        this.tokenizer.advance();
        this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, ";", ";");
        this.vmWritter.writePop(VMWriter_1.SEGMENTS.TEMP, 0);
    };
    CompilationEngine.prototype.compileLet = function () {
        this.tokenizer.advance();
        this.errorNotTokenType(tokenizer_1.TOKEN_TYPES.IDENTIFIER, "Identifier");
        var identifier = this.tokenizer.identifier();
        var identifierKind = this.symTable.kindOf(identifier);
        var identifierIndex = this.symTable.indexOf(identifier);
        var isArray = false;
        this.tokenizer.advance();
        if (this.assertToken(tokenizer_1.TOKEN_TYPES.SYMBOL, "[")) {
            isArray = true;
            this.compileExpression();
            this.vmWritter.writePush(this.convertKindToSegment(identifierKind), identifierIndex);
            this.vmWritter.writeArithmetic(VMWriter_1.VM_COMMANDS.ADD);
            this.tokenizer.advance();
            this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, "]", "]");
        }
        else {
            this.tokenizer.back();
        }
        this.tokenizer.advance();
        this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, "=", '"="');
        this.compileExpression();
        if (isArray) {
            this.vmWritter.writePop(VMWriter_1.SEGMENTS.TEMP, 0);
            this.vmWritter.writePop(VMWriter_1.SEGMENTS.POINTER, 1);
            this.vmWritter.writePush(VMWriter_1.SEGMENTS.TEMP, 0);
            this.vmWritter.writePop(VMWriter_1.SEGMENTS.THAT, 0);
        }
        else {
            this.vmWritter.writePop(this.convertKindToSegment(identifierKind), identifierIndex);
        }
        this.tokenizer.advance();
        this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, ";", '";"');
    };
    CompilationEngine.prototype.compileWhile = function () {
        var whileIndex = ++this.whileIndex;
        this.vmWritter.writeLabel(this.getWhileExp(whileIndex));
        this.tokenizer.advance();
        this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, "(", '"("');
        this.compileExpression();
        this.tokenizer.advance();
        this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, ")", '")"');
        this.compileUniaryOp("~");
        this.vmWritter.writeIf(this.getWhileEnd(whileIndex));
        this.tokenizer.advance();
        this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, "{", '"{"');
        this.compileStatement();
        this.tokenizer.advance();
        this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, "}", '"}"');
        this.vmWritter.writeGoto(this.getWhileExp(whileIndex));
        this.vmWritter.writeLabel(this.getWhileEnd(whileIndex));
    };
    CompilationEngine.prototype.compileReturn = function () {
        this.tokenizer.advance();
        if (this.assertToken(tokenizer_1.TOKEN_TYPES.SYMBOL, ";")) {
            this.vmWritter.writePush(VMWriter_1.SEGMENTS.CONSTANT, 0);
            this.tokenizer.back();
        }
        else {
            // if (this.currentFunctionReturnType === this.getKeyWord(KEYWORDS.VOID)) {
            //   error('"A non void function must return a value"');
            // }
            this.tokenizer.back();
            this.compileExpression();
        }
        this.vmWritter.writeReturn();
        this.tokenizer.advance();
        this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, ";", '";"');
        // if (this.currentMethodReturnType === this.getKeyWord(KEYWORDS.VOID)) {
        //   vmCmds += voidCmd;
        // }
    };
    CompilationEngine.prototype.compileIf = function () {
        var labelIndex = ++this.labelIndex;
        this.tokenizer.advance();
        this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, "(", '"("');
        this.compileExpression();
        this.tokenizer.advance();
        this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, ")", '")"');
        this.tokenizer.advance();
        this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, "{", '"{"');
        this.vmWritter.writeIf(this.getIfTrue(labelIndex));
        this.vmWritter.writeGoto(this.getIfFalse(labelIndex));
        this.vmWritter.writeLabel(this.getIfTrue(labelIndex));
        this.compileStatement();
        this.tokenizer.advance();
        this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, "}", '"}"');
        this.tokenizer.advance();
        if (this.assertToken(tokenizer_1.TOKEN_TYPES.KEYWORD, this.getKeyWord(tokenizer_1.KEYWORDS.ELSE))) {
            this.vmWritter.writeGoto(this.getIfEnd(labelIndex));
            this.tokenizer.advance();
            this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, "{", '"{"');
            this.vmWritter.writeLabel(this.getIfFalse(labelIndex));
            this.compileStatement();
            this.tokenizer.advance();
            this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, "}", '"}"');
            this.vmWritter.writeLabel(this.getIfEnd(labelIndex));
        }
        else {
            this.tokenizer.back();
            this.vmWritter.writeLabel(this.getIfFalse(labelIndex));
        }
    };
    CompilationEngine.prototype.compileExpression = function () {
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
            var vmCommand = this.getVMCommand(this.tokenizer.getCurrentToken());
            if ([">", "<", "&"].indexOf(this.tokenizer.getCurrentToken()) !== -1) {
                //   "symbol",
                //   this.convertSpeciallChars(this.tokenizer.getCurrentToken())
                // );
            }
            else {
            }
            this.compileTerm();
            this.vmWritter.writeCommand(vmCommand);
        }
    };
    CompilationEngine.prototype.getVMCommand = function (op) {
        var cmd = "";
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
    };
    CompilationEngine.prototype.compileTerm = function () {
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
            var identifier = this.tokenizer.identifier();
            var identifierKind = this.symTable.kindOf(identifier);
            var identifierIndex = this.symTable.indexOf(identifier);
            this.tokenizer.advance();
            this.compileExpression();
            this.vmWritter.writePush(this.convertKindToSegment(identifierKind), identifierIndex);
            this.vmWritter.writeArithmetic(VMWriter_1.VM_COMMANDS.ADD);
            this.vmWritter.writePop(VMWriter_1.SEGMENTS.POINTER, 1);
            this.vmWritter.writePush(VMWriter_1.SEGMENTS.THAT, 0);
            this.tokenizer.advance();
            this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, "]", "]");
        }
        else if (isSubroutCall) {
            this.tokenizer.back();
            this.compileSubroutineCall();
        }
        else if (isGroup) {
            this.compileExpression();
            this.tokenizer.advance();
            this.errorNotToken(tokenizer_1.TOKEN_TYPES.SYMBOL, ")", ")");
        }
        else if (isKeyConst) {
            var keyword = this.tokenizer.keyword();
            this.compileKeyConstant(keyword);
        }
        else if (isIntConst) {
            this.vmWritter.writePush(VMWriter_1.SEGMENTS.CONSTANT, this.tokenizer.intVal());
        }
        else if (isStringConst) {
            // const strLiteral = STRING_REGEX.exec(this.tokenizer.stringVal())[
            //   FIRST_MATCH
            // ];
            // console.log(strLiteral);
            var str = this.tokenizer.stringVal();
            var firstExcludeQuote = str.slice(1, str.length);
            var secondExcludeQuote = firstExcludeQuote.slice(0, firstExcludeQuote.length - 1);
            this.compileStringConstant(secondExcludeQuote);
        }
        else if (isUnaryOp) {
            var symbol = this.tokenizer.symbol();
            this.compileTerm();
            this.compileUniaryOp(symbol);
        }
        else if (isIdentifier) {
            var identifier = this.tokenizer.identifier();
            var identifierKind = this.symTable.kindOf(identifier);
            var identifierIndex = this.symTable.indexOf(identifier);
            this.vmWritter.writePush(this.convertKindToSegment(identifierKind), identifierIndex);
        }
    };
    CompilationEngine.prototype.compileKeyConstant = function (keyword) {
        switch (keyword) {
            case this.getKeyWord(tokenizer_1.KEYWORDS.TRUE):
                this.vmWritter.writePush(VMWriter_1.SEGMENTS.CONSTANT, 0);
                this.compileUniaryOp("~");
                break;
            case this.getKeyWord(tokenizer_1.KEYWORDS.NULL):
            case this.getKeyWord(tokenizer_1.KEYWORDS.FALSE):
                this.vmWritter.writePush(VMWriter_1.SEGMENTS.CONSTANT, 0);
                break;
            case this.getKeyWord(tokenizer_1.KEYWORDS.THIS):
                this.vmWritter.writePush(VMWriter_1.SEGMENTS.POINTER, 0);
                break;
        }
    };
    CompilationEngine.prototype.compileStringConstant = function (str) {
        var len = str.length;
        this.vmWritter.writePush(VMWriter_1.SEGMENTS.CONSTANT, len);
        this.vmWritter.writeCall("String.new", 1);
        for (var i = 0; i < len; i++) {
            var asciiCode = str.charCodeAt(i);
            this.vmWritter.writePush(VMWriter_1.SEGMENTS.CONSTANT, asciiCode);
            this.vmWritter.writeCall("String.appendChar", 2);
        }
    };
    CompilationEngine.prototype.compileUniaryOp = function (symbol) {
        var cmd;
        switch (symbol) {
            case "-":
                cmd = "neg";
                break;
            case "~":
                cmd = "not";
                break;
        }
        this.vmWritter.writeCommand(cmd);
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
        var numberOfArguments = 0;
        this.tokenizer.advance();
        if (this.assertToken(tokenizer_1.TOKEN_TYPES.SYMBOL, ")")) {
            this.tokenizer.back();
            return numberOfArguments;
        }
        this.tokenizer.back();
        numberOfArguments += 1;
        while (true) {
            this.compileExpression();
            this.tokenizer.advance();
            if (this.assertToken(tokenizer_1.TOKEN_TYPES.SYMBOL, ",")) {
                numberOfArguments += 1;
            }
            else if (this.assertToken(tokenizer_1.TOKEN_TYPES.SYMBOL, ")")) {
                this.tokenizer.back();
                break;
            }
            else {
                error('"," | ")"');
            }
        }
        return numberOfArguments;
    };
    CompilationEngine.prototype.convertKindToSegment = function (kind) {
        var segment;
        switch (kind) {
            case symbolTable_1.ALL_KINDS.ARG:
                segment = VMWriter_1.SEGMENTS.ARG;
                break;
            case symbolTable_1.ALL_KINDS.FIELD:
                segment = VMWriter_1.SEGMENTS.THIS;
                break;
            case symbolTable_1.ALL_KINDS.STATIC:
                segment = VMWriter_1.SEGMENTS.STATIC;
                break;
            case symbolTable_1.ALL_KINDS.VAR:
                segment = VMWriter_1.SEGMENTS.LOCAL;
                break;
        }
        return segment;
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
        return (currentToken === mThis ||
            currentToken === mTrue ||
            currentToken === mFalse ||
            currentToken === mNull);
    };
    return CompilationEngine;
}());
exports.default = CompilationEngine;
