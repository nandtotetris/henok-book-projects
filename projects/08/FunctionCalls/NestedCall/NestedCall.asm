(Sys.init)
@4000
D=A
@SP
AM=M+1
A=A-1
M=D
@SP
AM=M-1
D=M
@3
M=D
@5000
D=A
@SP
AM=M+1
A=A-1
M=D
@SP
AM=M-1
D=M
@4
M=D

// CALL BEGIN
@RETURN_ADDRESS_1
D=A
@SP
AM=M+1
A=A-1
M=D
@LCL
D=M
@SP
AM=M+1
A=A-1
M=D
@ARG
D=M
@SP
AM=M+1
A=A-1
M=D
@THIS
D=M
@SP
AM=M+1
A=A-1
M=D
@THAT
D=M
@SP
AM=M+1
A=A-1
M=D
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
@Sys.main
0;JMP

(RETURN_ADDRESS_1)
// CALL END

@SP
AM=M-1
D=M
@6
M=D
(LOOP)
@LOOP
0;JMP


(Sys.main)
@0
D=A
@SP
AM=M+1
A=A-1
M=D
@0
D=A
@SP
AM=M+1
A=A-1
M=D
@0
D=A
@SP
AM=M+1
A=A-1
M=D
@0
D=A
@SP
AM=M+1
A=A-1
M=D
@0
D=A
@SP
AM=M+1
A=A-1
M=D
@4001
D=A
@SP
AM=M+1
A=A-1
M=D
@SP
AM=M-1
D=M
@3
M=D
@5001
D=A
@SP
AM=M+1
A=A-1
M=D
@SP
AM=M-1
D=M
@4
M=D
@200
D=A
@SP
AM=M+1
A=A-1
M=D
@LCL
AD=M
@1
AD=A+D
@R13
M=D
@SP
AM=M-1
D=M
@R13
A=M
M=D
@40
D=A
@SP
AM=M+1
A=A-1
M=D
@LCL
AD=M
@2
AD=A+D
@R13
M=D
@SP
AM=M-1
D=M
@R13
A=M
M=D
@6
D=A
@SP
AM=M+1
A=A-1
M=D
@LCL
AD=M
@3
AD=A+D
@R13
M=D
@SP
AM=M-1
D=M
@R13
A=M
M=D
@123
D=A
@SP
AM=M+1
A=A-1
M=D

// CALL BEGIN
@RETURN_ADDRESS_2
D=A
@SP
AM=M+1
A=A-1
M=D
@LCL
D=M
@SP
AM=M+1
A=A-1
M=D
@ARG
D=M
@SP
AM=M+1
A=A-1
M=D
@THIS
D=M
@SP
AM=M+1
A=A-1
M=D
@THAT
D=M
@SP
AM=M+1
A=A-1
M=D
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
@Sys.add12
0;JMP

(RETURN_ADDRESS_2)
// CALL END

@SP
AM=M-1
D=M
@5
M=D
@LCL
D=M
@0
A=A+D
D=M
@SP
AM=M+1
A=A-1
M=D
@LCL
D=M
@1
A=A+D
D=M
@SP
AM=M+1
A=A-1
M=D
@LCL
D=M
@2
A=A+D
D=M
@SP
AM=M+1
A=A-1
M=D
@LCL
D=M
@3
A=A+D
D=M
@SP
AM=M+1
A=A-1
M=D
@LCL
D=M
@4
A=A+D
D=M
@SP
AM=M+1
A=A-1
M=D
@SP
AM=M-1
D=M
@SP
AM=M-1
A=M
D=D+A
@SP
AM=M+1
A=A-1
M=D
@SP
AM=M-1
D=M
@SP
AM=M-1
A=M
D=D+A
@SP
AM=M+1
A=A-1
M=D
@SP
AM=M-1
D=M
@SP
AM=M-1
A=M
D=D+A
@SP
AM=M+1
A=A-1
M=D
@SP
AM=M-1
D=M
@SP
AM=M-1
A=M
D=D+A
@SP
AM=M+1
A=A-1
M=D

// RETURN BEGIN
@LCL
D=M
@R13
M=D
@5
D=A
@R13
A=M-D
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
A=M-D
D=M
@THAT
M=D
@2
D=A
@R13
A=M-D
D=M
@THIS
M=D
@3
D=A
@R13
A=M-D
D=M
@ARG
M=D
@4
D=A
@R13
A=M-D
D=M
@LCL
M=D
@R14
A=M
0;JMP
// RETURN END


(Sys.add12)
@4002
D=A
@SP
AM=M+1
A=A-1
M=D
@SP
AM=M-1
D=M
@3
M=D
@5002
D=A
@SP
AM=M+1
A=A-1
M=D
@SP
AM=M-1
D=M
@4
M=D
@ARG
D=M
@0
A=A+D
D=M
@SP
AM=M+1
A=A-1
M=D
@12
D=A
@SP
AM=M+1
A=A-1
M=D
@SP
AM=M-1
D=M
@SP
AM=M-1
A=M
D=D+A
@SP
AM=M+1
A=A-1
M=D

// RETURN BEGIN
@LCL
D=M
@R13
M=D
@5
D=A
@R13
A=M-D
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
A=M-D
D=M
@THAT
M=D
@2
D=A
@R13
A=M-D
D=M
@THIS
M=D
@3
D=A
@R13
A=M-D
D=M
@ARG
M=D
@4
D=A
@R13
A=M-D
D=M
@LCL
M=D
@R14
A=M
0;JMP
// RETURN END
