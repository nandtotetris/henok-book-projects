@256
D=A
@SP
M=D

// CALL BEGIN
@RETURN_ADDRESS_1
D=A
@SP
A=M
M=D
@SP
M=M+1
@LCL
D=M
@SP
A=M
M=D
@SP
M=M+1
@ARG
D=M
@SP
A=M
M=D
@SP
M=M+1
@THIS
D=M
@SP
A=M
M=D
@SP
M=M+1
@THAT
D=M
@SP
A=M
M=D
@SP
M=M+1
@SP
D=M
@0
D=D-A
@5
D=D-A
@ARG
M=D
@SP
D=M
@LCL
M=D
@Sys.init
0;JMP

(RETURN_ADDRESS_1)
// CALL END

(Main.fibonacci)
@ARG
D=M
@0
A=A+D
D=M
@SP
A=M
M=D
@SP
M=M+1
@2
D=A
@SP
A=M
M=D
@SP
M=M+1
@SP
M=M-1
@SP
A=M
D=M
@SP
M=M-1
@SP
A=M
A=M
D=D-A
@EQUAL_1
D;JLE
D=-1
@END_EQUAL_1
0;JMP
(EQUAL_1)
D=0
(END_EQUAL_1)
@SP
A=M
M=D
@SP
M=M+1
@SP
M=M-1
@SP
A=M
D=M
@IF_TRUE
D;JLT
@IF_FALSE
0;JMP

(IF_TRUE)
@ARG
D=M
@0
A=A+D
D=M
@SP
A=M
M=D
@SP
M=M+1

// RETURN BEGIN
@LCL
D=M
@5
M=D
@5
D=A
@5
A=M
A=A-D
D=M
@R14
M=D
@5
D=A
@1
D=A+D
@R14
A=M
@R15
M=D
@R14
A=M
D=A
@R15
A=M
M=D
@SP
M=M-1
@SP
A=M
D=M
@ARG
A=M
M=D
@ARG
D=M
@1
D=A+D
@SP
M=D
@1
D=A
@5
A=M
A=A-D
D=M
@THAT
M=D
@2
D=A
@5
A=M
A=A-D
D=M
@THIS
M=D
@3
D=A
@5
A=M
A=A-D
D=M
@ARG
M=D
@4
D=A
@5
A=M
A=A-D
D=M
@LCL
M=D
@1
D=A
@5
A=A+D
A=M
0;JMP
// RETURN END

(IF_FALSE)
@ARG
D=M
@0
A=A+D
D=M
@SP
A=M
M=D
@SP
M=M+1
@2
D=A
@SP
A=M
M=D
@SP
M=M+1
@SP
M=M-1
@SP
A=M
D=M
@SP
M=M-1
@SP
A=M
A=M
D=D-A
@SP
A=M
M=D
@SP
M=M+1
@SP
M=M-1
@SP
A=M
D=M
D=-D
@SP
A=M
M=D
@SP
M=M+1

// CALL BEGIN
@RETURN_ADDRESS_2
D=A
@SP
A=M
M=D
@SP
M=M+1
@LCL
D=M
@SP
A=M
M=D
@SP
M=M+1
@ARG
D=M
@SP
A=M
M=D
@SP
M=M+1
@THIS
D=M
@SP
A=M
M=D
@SP
M=M+1
@THAT
D=M
@SP
A=M
M=D
@SP
M=M+1
@SP
D=M
@1
D=D-A
@5
D=D-A
@ARG
M=D
@SP
D=M
@LCL
M=D
@Main.fibonacci
0;JMP

(RETURN_ADDRESS_2)
// CALL END

@ARG
D=M
@0
A=A+D
D=M
@SP
A=M
M=D
@SP
M=M+1
@1
D=A
@SP
A=M
M=D
@SP
M=M+1
@SP
M=M-1
@SP
A=M
D=M
@SP
M=M-1
@SP
A=M
A=M
D=D-A
@SP
A=M
M=D
@SP
M=M+1
@SP
M=M-1
@SP
A=M
D=M
D=-D
@SP
A=M
M=D
@SP
M=M+1

// CALL BEGIN
@RETURN_ADDRESS_3
D=A
@SP
A=M
M=D
@SP
M=M+1
@LCL
D=M
@SP
A=M
M=D
@SP
M=M+1
@ARG
D=M
@SP
A=M
M=D
@SP
M=M+1
@THIS
D=M
@SP
A=M
M=D
@SP
M=M+1
@THAT
D=M
@SP
A=M
M=D
@SP
M=M+1
@SP
D=M
@1
D=D-A
@5
D=D-A
@ARG
M=D
@SP
D=M
@LCL
M=D
@Main.fibonacci
0;JMP

(RETURN_ADDRESS_3)
// CALL END

@SP
M=M-1
@SP
A=M
D=M
@SP
M=M-1
@SP
A=M
A=M
D=D+A
@SP
A=M
M=D
@SP
M=M+1

// RETURN BEGIN
@LCL
D=M
@5
M=D
@5
D=A
@5
A=M
A=A-D
D=M
@R14
M=D
@5
D=A
@1
D=A+D
@R14
A=M
@R15
M=D
@R14
A=M
D=A
@R15
A=M
M=D
@SP
M=M-1
@SP
A=M
D=M
@ARG
A=M
M=D
@ARG
D=M
@1
D=A+D
@SP
M=D
@1
D=A
@5
A=M
A=A-D
D=M
@THAT
M=D
@2
D=A
@5
A=M
A=A-D
D=M
@THIS
M=D
@3
D=A
@5
A=M
A=A-D
D=M
@ARG
M=D
@4
D=A
@5
A=M
A=A-D
D=M
@LCL
M=D
@1
D=A
@5
A=A+D
A=M
0;JMP
// RETURN END
(Sys.init)
@4
D=A
@SP
A=M
M=D
@SP
M=M+1

// CALL BEGIN
@RETURN_ADDRESS_4
D=A
@SP
A=M
M=D
@SP
M=M+1
@LCL
D=M
@SP
A=M
M=D
@SP
M=M+1
@ARG
D=M
@SP
A=M
M=D
@SP
M=M+1
@THIS
D=M
@SP
A=M
M=D
@SP
M=M+1
@THAT
D=M
@SP
A=M
M=D
@SP
M=M+1
@SP
D=M
@1
D=D-A
@5
D=D-A
@ARG
M=D
@SP
D=M
@LCL
M=D
@Main.fibonacci
0;JMP

(RETURN_ADDRESS_4)
// CALL END

(WHILE)
@WHILE
0;JMP