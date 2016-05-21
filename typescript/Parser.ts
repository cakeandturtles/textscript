class Parser{
    private current_lexeme: Lexeme;
    private lexer: Lexer;
    private grammatical_functions: { [id: string] : Function};

    constructor(grammar_text: string){
        this.grammatical_functions = ParserGenerator.GenerateGrammaticalFunctions(grammar_text);
    }

    private fatal(error: string): void{
        alert(error);
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
        this.lexer = new Lexer(program_text);
        this.current_lexeme = this.lexer.lex();
        var i: number = 0;
        while (this.current_lexeme.type != END_OF_INPUT){
            this.statement();
            i++;
            print("number of statements: " + i);
        }
    }

    private statement(): void{
        this.grammatical_functions["statement"](this);
    }
}
