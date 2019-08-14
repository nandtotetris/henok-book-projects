// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/04/Fill.asm

// Runs an infinite loop that listens to the keyboard input. 
// When a key is pressed (any key), the program blackens the screen,
// i.e. writes "black" in every pixel. When no key is pressed, the
// program clears the screen, i.e. writes "white" in every pixel.

@color
M=0

(LOOP)
    @SCREEN
    D=A
    @currentpixel
    M=D

    @KBD
    D=M
    @BLACK
    D;JGT

    @color
    M=0
    @COLOR
    0;JMP

    (BLACK)
        @color
        M=-1

    (COLOR)
        @color
        D=M
        @currentpixel
        A=M
        M=D

        @currentpixel
        M=M+1
        D=M

        @KBD
        D=D-A
        @COLOR
        D;JLT

@LOOP
0;JMP