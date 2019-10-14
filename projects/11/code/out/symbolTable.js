"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var KINDS;
(function (KINDS) {
    KINDS[KINDS["STATIC"] = 1] = "STATIC";
    KINDS[KINDS["FIELD"] = 2] = "FIELD";
    KINDS[KINDS["ARG"] = 3] = "ARG";
    KINDS[KINDS["VAR"] = 4] = "VAR";
})(KINDS = exports.KINDS || (exports.KINDS = {}));
var ALL_KINDS;
(function (ALL_KINDS) {
    ALL_KINDS[ALL_KINDS["STATIC"] = 1] = "STATIC";
    ALL_KINDS[ALL_KINDS["FIELD"] = 2] = "FIELD";
    ALL_KINDS[ALL_KINDS["ARG"] = 3] = "ARG";
    ALL_KINDS[ALL_KINDS["VAR"] = 4] = "VAR";
    ALL_KINDS[ALL_KINDS["NONE"] = 5] = "NONE";
})(ALL_KINDS = exports.ALL_KINDS || (exports.ALL_KINDS = {}));
var TYPE = 0;
var KIND = 1;
var INDEX = 2;
var SymbolTable = /** @class */ (function () {
    function SymbolTable() {
        this.methodSymTable = {};
        this.classSymTable = {};
    }
    SymbolTable.prototype.startSubroutine = function () {
        this.methodSymTable = {};
    };
    SymbolTable.prototype.log = function () {
        console.log(this.classSymTable);
        console.log(this.methodSymTable);
    };
    SymbolTable.prototype.define = function (name, type, kind) {
        if (kind === KINDS.FIELD || kind == KINDS.STATIC) {
            // class level variables
            this.classSymTable[name] = [type, kind, this.varCount(kind)];
        }
        else {
            this.methodSymTable[name] = [type, kind, this.varCount(kind)];
        }
    };
    SymbolTable.prototype.varCount = function (kind) {
        var count = 0;
        if (kind === KINDS.FIELD || kind === KINDS.STATIC) {
            count = this.countFromClassSymTable(kind);
        }
        else if (kind === KINDS.ARG || kind === KINDS.VAR) {
            count = this.countFromMethodSymTable(kind);
        }
        return count;
    };
    SymbolTable.prototype.doesKindExist = function (requiredKey, kind) {
        return requiredKey === kind;
    };
    SymbolTable.prototype.countFromMethodSymTable = function (requiredKey) {
        var _this = this;
        var count = 0;
        Object.keys(this.methodSymTable).forEach(function (key) {
            if (_this.doesKindExist(requiredKey, _this.methodSymTable[key][KIND]))
                count += 1;
        });
        return count;
    };
    SymbolTable.prototype.countFromClassSymTable = function (requiredKey) {
        var _this = this;
        var count = 0;
        Object.keys(this.classSymTable).forEach(function (key) {
            if (_this.doesKindExist(requiredKey, _this.classSymTable[key][KIND]))
                count += 1;
        });
        return count;
    };
    SymbolTable.prototype.kindOf = function (name) {
        var kind = ALL_KINDS.NONE;
        if (this.methodSymTable.hasOwnProperty(name)) {
            kind = this.methodSymTable[name][KIND];
        }
        else if (this.classSymTable.hasOwnProperty(name)) {
            kind = this.classSymTable[name][KIND];
        }
        return kind;
    };
    SymbolTable.prototype.typeOf = function (name) {
        var type = "UNKNOWN";
        if (this.methodSymTable.hasOwnProperty(name)) {
            type = this.methodSymTable[name][TYPE];
        }
        else if (this.classSymTable.hasOwnProperty(name)) {
            type = this.classSymTable[name][TYPE];
        }
        return type;
    };
    SymbolTable.prototype.indexOf = function (name) {
        var index = -1;
        if (this.methodSymTable.hasOwnProperty(name)) {
            index = this.methodSymTable[name][INDEX];
        }
        else if (this.classSymTable.hasOwnProperty(name)) {
            index = this.classSymTable[name][INDEX];
        }
        return index;
    };
    return SymbolTable;
}());
// const symTable = new SymbolTable();
// symTable.define("dx", "int", KINDS.FIELD);
// symTable.define("dy", "int", KINDS.FIELD);
// symTable.define("dz", "int", KINDS.STATIC);
// symTable.define("x", "int", KINDS.VAR);
// symTable.define("y", "char", KINDS.VAR);
// symTable.startSubroutine();
// symTable.define("z", "char", KINDS.ARG);
// symTable.log();
exports.default = SymbolTable;
