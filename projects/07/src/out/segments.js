"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SEGMENTS;
(function (SEGMENTS) {
    SEGMENTS[SEGMENTS["CONSTANT"] = 1] = "CONSTANT";
    SEGMENTS[SEGMENTS["STATIC"] = 2] = "STATIC";
})(SEGMENTS || (SEGMENTS = {}));
exports.SEGMENTS = SEGMENTS;
// // FRAME = LCL
// @LCL
// D=M    // push the LCL at temp
// @TEMP
// M=D
// // RET = *(FRAME - 5)
// @5
// D=A
// @TEMP
// A=M
// A=A-D
// D=M      // Return address
// @R14 // Save return address
// M=D
// ----
// @TEMP
// D=A    // push the return address to  temp + 1
// @1
// D=A+D
// ---
// @R14 // Restore return address
// A=M
// @R15
// M=D
// D=A    // change D and A
// @R15
// A=M
// M=D // finaly save the return address at temp + 1
// // pop and get top of the stack
// @SP
// M=M-1
// @SP
// A=M
// D=M
// ---
// // save top stack value at arg0
// @ARG
// A=M
// M=D
// -----
// // set SP to ARG + 1
// @ARG
// D=M
// @1
// D=A+D
// @SP
// M=D
// // *(FRAME-1)
// @1
// D=A
// @TEMP
// A=M
// A=A-D
// D=M
// // set THAT to *(FRAME-1)
// @THAT
// M=D
// .
// .
// .
// The same applies to THIS, ARG and LCL segments by changing the segment and the index, which is 1 and THAT in the above example
// // goto RET
// @1
// D=A
// @TEMP
// A=A+D
// A=M
// 0;JMP
