class Parser{
    private current_lexeme: Lexeme;
    private lexer: Lexer;
    private grammatical_functions: { [id: string] : Function};

    private is_valid_syntax: boolean = true;

    constructor(grammar_text: string){
        this.grammatical_functions = ParserGenerator.GenerateGrammaticalFunctions(grammar_text);
    }

    private fatal(error: string): void{
        print(error);
        this.current_lexeme = new Lexeme(END_OF_INPUT);
        this.is_valid_syntax = false;
    }

    private check(type: string): boolean {
        return this.current_lexeme.type === type;
    }
    private advance(): void {
        this.current_lexeme = this.lexer.lex();
    }
    private match(type: string): void {
        this.matchNoAdvance(type);
        this.advance();
    }
    private matchNoAdvance(type: string ): void {
        if (!this.check(type)){
            this.fatal("syntax error: " + type);
        }else{
            print(type);
        }
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

    private statement(): void{
        this.grammatical_functions["statement"](this);
    }
}
