"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var MULTILINE_COMMENT = /\/\*([\s\S]*?)\*\//g;
var IDENTIFIER_REGEX = /[\w_]+/;
var SYMBOL_REGEX = /[[\]\\&\\*\\+\\(\\)\\.\\/\\,\-\\;\\~\\}\\|\\{\\>\\=\\<]/;
var NUMBER_REGEX = /^[0-9]+/;
var REMOVE_COMMENT = /\/\/\s*[^\n]+/g;
exports.STRING_REGEX = /"([^"]*)"/g;
var TOKEN_TYPES;
(function (TOKEN_TYPES) {
    TOKEN_TYPES[TOKEN_TYPES["KEYWORD"] = 1] = "KEYWORD";
    TOKEN_TYPES[TOKEN_TYPES["SYMBOL"] = 2] = "SYMBOL";
    TOKEN_TYPES[TOKEN_TYPES["IDENTIFIER"] = 3] = "IDENTIFIER";
    TOKEN_TYPES[TOKEN_TYPES["INT_CONST"] = 4] = "INT_CONST";
    TOKEN_TYPES[TOKEN_TYPES["STRING_CONST"] = 5] = "STRING_CONST";
})(TOKEN_TYPES = exports.TOKEN_TYPES || (exports.TOKEN_TYPES = {}));
var KEYWORDS;
(function (KEYWORDS) {
    KEYWORDS[KEYWORDS["CLASS"] = 1] = "CLASS";
    KEYWORDS[KEYWORDS["METHOD"] = 2] = "METHOD";
    KEYWORDS[KEYWORDS["FUNCTION"] = 3] = "FUNCTION";
    KEYWORDS[KEYWORDS["CONSTRUCTOR"] = 4] = "CONSTRUCTOR";
    KEYWORDS[KEYWORDS["INT"] = 5] = "INT";
    KEYWORDS[KEYWORDS["BOOLEAN"] = 6] = "BOOLEAN";
    KEYWORDS[KEYWORDS["CHAR"] = 7] = "CHAR";
    KEYWORDS[KEYWORDS["VOID"] = 8] = "VOID";
    KEYWORDS[KEYWORDS["VAR"] = 9] = "VAR";
    KEYWORDS[KEYWORDS["STATIC"] = 10] = "STATIC";
    KEYWORDS[KEYWORDS["FIELD"] = 11] = "FIELD";
    KEYWORDS[KEYWORDS["LET"] = 12] = "LET";
    KEYWORDS[KEYWORDS["DO"] = 13] = "DO";
    KEYWORDS[KEYWORDS["IF"] = 14] = "IF";
    KEYWORDS[KEYWORDS["ELSE"] = 15] = "ELSE";
    KEYWORDS[KEYWORDS["WHILE"] = 16] = "WHILE";
    KEYWORDS[KEYWORDS["RETURN"] = 17] = "RETURN";
    KEYWORDS[KEYWORDS["TRUE"] = 18] = "TRUE";
    KEYWORDS[KEYWORDS["FALSE"] = 19] = "FALSE";
    KEYWORDS[KEYWORDS["NULL"] = 20] = "NULL";
    KEYWORDS[KEYWORDS["THIS"] = 21] = "THIS";
})(KEYWORDS = exports.KEYWORDS || (exports.KEYWORDS = {}));
var Tokenizer = /** @class */ (function () {
    function Tokenizer(filePath) {
        this.data = "";
        this.tokens = [];
        this.currentIndex = -1;
        this.data = fs.readFileSync(filePath, "utf8");
        this.removeComment();
        this.normalizeData(this.preprocess());
        this.setTokenPatterns();
        this.tokenize();
    }
    Tokenizer.prototype.getCurrentToken = function () {
        return this.currentToken;
    };
    Tokenizer.prototype.tokenize = function () {
        var _this = this;
        this.normData.match(this.tokenPatterns).forEach(function (token) {
            _this.tokens.push(token);
        });
    };
    Tokenizer.prototype.setTokenPatterns = function () {
        var keywordString = "";
        for (var keyword in KEYWORDS) {
            var isValueProperty = parseInt(keyword, 10) >= 0;
            if (isValueProperty) {
                keywordString += KEYWORDS[keyword].toLowerCase() + "|";
            }
        }
        keywordString = keywordString.slice(0, keywordString.length - 1);
        keywordString = "\\b(?:" + keywordString + ")\\b";
        this.keywordRegex = new RegExp(keywordString);
        this.tokenPatterns = new RegExp(this.keywordRegex.source +
            "|" +
            SYMBOL_REGEX.source +
            "|" +
            NUMBER_REGEX.source +
            "|" +
            exports.STRING_REGEX.source +
            "|" +
            IDENTIFIER_REGEX.source, "g");
    };
    Tokenizer.prototype.removeComment = function () {
        this.data = this.data.replace(REMOVE_COMMENT, "").trim();
        this.data = this.data.replace(MULTILINE_COMMENT, "").trim();
    };
    Tokenizer.prototype.preprocess = function () {
        var splitCommands = this.data.split("\n");
        var instructions = splitCommands.filter(function (instruction) {
            return instruction.trim().length > 0;
        });
        return this.trimCommands(instructions);
    };
    Tokenizer.prototype.trimCommands = function (instructions) {
        var sanitizedCommands = instructions.map(function (vmCommand) {
            return vmCommand.trim();
        });
        return sanitizedCommands;
    };
    Tokenizer.prototype.normalizeData = function (instructions) {
        var normData = "";
        instructions.forEach(function (instruction) {
            normData += instruction + "\n";
        });
        this.normData = normData;
    };
    Tokenizer.prototype.hasMoreTokens = function () {
        return this.currentIndex < this.tokens.length - 1;
    };
    Tokenizer.prototype.isNotTokensEmpty = function () {
        return this.currentIndex >= 1;
    };
    Tokenizer.prototype.advance = function () {
        if (this.hasMoreTokens()) {
            this.currentIndex += 1;
            this.currentToken = this.tokens[this.currentIndex] + "";
        }
    };
    Tokenizer.prototype.back = function () {
        if (this.isNotTokensEmpty()) {
            this.currentIndex -= 1;
            this.currentToken = this.tokens[this.currentIndex] + "";
        }
    };
    Tokenizer.prototype.tokenType = function () {
        var type;
        var token = this.currentToken;
        if (this.keywordRegex.test(token)) {
            type = TOKEN_TYPES.KEYWORD;
        }
        else if (exports.STRING_REGEX.test(token)) {
            type = TOKEN_TYPES.STRING_CONST;
        }
        else if (SYMBOL_REGEX.test(token)) {
            type = TOKEN_TYPES.SYMBOL;
        }
        else if (NUMBER_REGEX.test(token)) {
            type = TOKEN_TYPES.INT_CONST;
        }
        else if (IDENTIFIER_REGEX.test(token)) {
            type = TOKEN_TYPES.IDENTIFIER;
        }
        return type;
    };
    Tokenizer.prototype.keyword = function () {
        if (this.tokenType() == TOKEN_TYPES.KEYWORD) {
            return this.currentToken;
        }
    };
    Tokenizer.prototype.symbol = function () {
        if (this.tokenType() == TOKEN_TYPES.SYMBOL) {
            return this.currentToken;
        }
    };
    Tokenizer.prototype.identifier = function () {
        if (this.tokenType() == TOKEN_TYPES.IDENTIFIER) {
            return this.currentToken;
        }
    };
    Tokenizer.prototype.intVal = function () {
        if (this.tokenType() == TOKEN_TYPES.INT_CONST) {
            return parseInt(this.currentToken);
        }
    };
    Tokenizer.prototype.stringVal = function () {
        if (this.tokenType() == TOKEN_TYPES.STRING_CONST) {
            return this.currentToken;
        }
    };
    return Tokenizer;
}());
exports.default = Tokenizer;
