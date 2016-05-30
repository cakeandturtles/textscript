class Parser{
    protected current_lexeme: Lexeme;
    protected lexer: Lexer;
    protected grammatical_functions: { [id: string] : Function};

    protected is_valid_syntax: boolean = true;

    constructor(){
    }

    protected fatal(error: string): void{
        print(error);
        this.current_lexeme = new Lexeme(END_OF_INPUT);
        this.is_valid_syntax = false;
    }

    protected check(type: string): boolean {
        return this.current_lexeme.type === type;
    }
    private advance(): Lexeme {
        var old_lexeme = this.current_lexeme;
        this.current_lexeme = this.lexer.lex();
        return old_lexeme;
    }
    protected match(type: string): Lexeme {
        if (this.check(type)){
            return this.advance();
        }
        this.fatal("parse error: looking for " + type + ", found " +
                   this.current_lexeme.type + " instead\n");
        return undefined;
    }

    public parse(program_text: string): void {
        this.is_valid_syntax = true;
        this.lexer = new Lexer(program_text);
        this.current_lexeme = this.lexer.lex();
        let i: number = 0;
        let prev_index: number = 0;
        while (this.current_lexeme.type != END_OF_INPUT){
            this.statement();
            let index: number = this.lexer.getCharIndex();

            if (index === prev_index){
                this.lexer.backup();
                this.syntaxErrorAtPosition();
                break;
            }

            i++;
            prev_index = index;
            print("number of statements: " + i);
        }

        if (this.is_valid_syntax){
            alert("good syntax");
        }else alert("bad syntax");
    }

    private syntaxErrorAtPosition(): void{
        let msg: string = "";
        let err_index = this.lexer.getIndexOnLine();

        msg += "on line " + (this.lexer.getLineNum() + 1);
        msg += "\n\t" + this.lexer.getLine();
        msg += "\n\t";
        for (let j = 0; j < err_index; j++){
            msg += " ";
        }
        msg += "^";
        msg += "\nsyntax error: invalid syntax";
        this.fatal(msg);
    }

    /**************************************************************************/

    private statement(): void{

    }
}
