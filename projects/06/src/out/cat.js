"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Cat = /** @class */ (function () {
    function Cat(meow) {
        this.meow = meow;
    }
    Cat.prototype.sayMeow = function () {
        return this.meow;
    };
    return Cat;
}());
exports.default = Cat;
