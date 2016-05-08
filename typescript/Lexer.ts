class Lexeme {
    constructor(public type : string, public value? : any){
    }
}

class Lexer{
    private input : InputFile;
    constructor(program_txt : string){
        this.input = new InputFile(program_txt);
    }

    private skipWhitespace() : void
    {
        var ch : string;
        ch = this.input.read();
        while (ch == " " || ch == "\t"){
            ch = this.input.read();
        }
        this.input.backup();
    }

    public lex() : Lexeme
    {
        var ch : string;
        this.skipWhitespace();

        ch = this.input.read();
        if (this.input.failed)
            return new Lexeme(END_OF_INPUT);


        return new Lexeme("UNKNOWN", {});
    }
}
