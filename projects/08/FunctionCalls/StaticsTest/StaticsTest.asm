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

(Class1.set)
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
@SP
AM=M-1
D=M
@Class1.0
M=D
@ARG
D=M
@1
A=A+D
D=M
@SP
A=M
M=D
@SP
M=M+1
@SP
AM=M-1
D=M
@Class1.1
M=D
@0
D=A
@SP
A=M
M=D
@SP
M=M+1

// RETURN BEGIN
@LCL
D=M
@R13
M=D
@5
D=A
@R13
A=M
A=A-D
D=M
@R14
M=D
@SP
AM=M-1
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
@R13
A=M
A=A-D
D=M
@THAT
M=D
@2
D=A
@R13
A=M
A=A-D
D=M
@THIS
M=D
@3
D=A
@R13
A=M
A=A-D
D=M
@ARG
M=D
@4
D=A
@R13
A=M
A=A-D
D=M
@LCL
M=D
@R14
A=M
0;JMP
// RETURN END


(Class1.get)
@Class1.0
D=M
@SP
A=M
M=D
@SP
M=M+1
@Class1.1
D=M
@SP
A=M
M=D
@SP
M=M+1
@SP
AM=M-1
D=M
@SP
AM=M-1
A=M
D=D-A
@SP
A=M
M=D
@SP
M=M+1
@SP
AM=M-1
D=M
D=-D
@SP
A=M
M=D
@SP
M=M+1

// RETURN BEGIN
@LCL
D=M
@R13
M=D
@5
D=A
@R13
A=M
A=A-D
D=M
@R14
M=D
@SP
AM=M-1
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
@R13
A=M
A=A-D
D=M
@THAT
M=D
@2
D=A
@R13
A=M
A=A-D
D=M
@THIS
M=D
@3
D=A
@R13
A=M
A=A-D
D=M
@ARG
M=D
@4
D=A
@R13
A=M
A=A-D
D=M
@LCL
M=D
@R14
A=M
0;JMP
// RETURN END
(Class2.set)
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
@SP
AM=M-1
D=M
@Class2.0
M=D
@ARG
D=M
@1
A=A+D
D=M
@SP
A=M
M=D
@SP
M=M+1
@SP
AM=M-1
D=M
@Class2.1
M=D
@0
D=A
@SP
A=M
M=D
@SP
M=M+1

// RETURN BEGIN
@LCL
D=M
@R13
M=D
@5
D=A
@R13
A=M
A=A-D
D=M
@R14
M=D
@SP
AM=M-1
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
@R13
A=M
A=A-D
D=M
@THAT
M=D
@2
D=A
@R13
A=M
A=A-D
D=M
@THIS
M=D
@3
D=A
@R13
A=M
A=A-D
D=M
@ARG
M=D
@4
D=A
@R13
A=M
A=A-D
D=M
@LCL
M=D
@R14
A=M
0;JMP
// RETURN END


(Class2.get)
@Class2.0
D=M
@SP
A=M
M=D
@SP
M=M+1
@Class2.1
D=M
@SP
A=M
M=D
@SP
M=M+1
@SP
AM=M-1
D=M
@SP
AM=M-1
A=M
D=D-A
@SP
A=M
M=D
@SP
M=M+1
@SP
AM=M-1
D=M
D=-D
@SP
A=M
M=D
@SP
M=M+1

// RETURN BEGIN
@LCL
D=M
@R13
M=D
@5
D=A
@R13
A=M
A=A-D
D=M
@R14
M=D
@SP
AM=M-1
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
@R13
A=M
A=A-D
D=M
@THAT
M=D
@2
D=A
@R13
A=M
A=A-D
D=M
@THIS
M=D
@3
D=A
@R13
A=M
A=A-D
D=M
@ARG
M=D
@4
D=A
@R13
A=M
A=A-D
D=M
@LCL
M=D
@R14
A=M
0;JMP
// RETURN END
(Sys.init)
@6
D=A
@SP
A=M
M=D
@SP
M=M+1
@8
D=A
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
@2
D=D-A
@5
D=D-A
@ARG
M=D
@SP
D=M
@LCL
M=D
@Class1.set
0;JMP

(RETURN_ADDRESS_2)
// CALL END

@5
D=A
@0
A=A+D
D=A
@R13
M=D
@SP
AM=M-1
D=M
@R13
A=M
M=D
@23
D=A
@SP
A=M
M=D
@SP
M=M+1
@15
D=A
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
@2
D=D-A
@5
D=D-A
@ARG
M=D
@SP
D=M
@LCL
M=D
@Class2.set
0;JMP

(RETURN_ADDRESS_3)
// CALL END

@5
D=A
@0
A=A+D
D=A
@R13
M=D
@SP
AM=M-1
D=M
@R13
A=M
M=D

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
@Class1.get
0;JMP

(RETURN_ADDRESS_4)
// CALL END


// CALL BEGIN
@RETURN_ADDRESS_5
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
@Class2.get
0;JMP

(RETURN_ADDRESS_5)
// CALL END

(WHILE)
@WHILE
0;JMP
