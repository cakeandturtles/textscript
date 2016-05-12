class Parser{
    private current_lexeme : Lexeme;
    private lexer : Lexer;
    private grammatical_functions : { [id: string] : Function};

    private check(type : string) : void {

    }
    private advance() : void {}
    private match(type : string) : void {

    }
    private matchNoAdvance() : void {}
    private statement() : void {}

    private operator() : void {
        if (this.check(PLUS)){
            this.match(PLUS);
        }else if (this.check(TIMES)){
            this.match(TIMES);
        }else if (this.check(MINUS)){
            this.match(MINUS);
        }else if (this.check(DIVIDED_BY)){
            this.match(DIVIDED_BY);
        }
    }

    constructor(){
        //TODO: pull the text content from Grammar.ts
        var grammar_text : string = "var operator = PLUS || TIMES || MINUS || DIVIDED_BY";
        var grammar_text_rules : string[] = grammar_text.split(";");

        //generate methods for each grammar rule!
        for (var i : number = 0; i < grammar_text_rules.length; i++){
            //assuming grammar is well defined
            var grammar_text_rule : string[] = grammar_text_rules[i].split("=");
            var lsh : string = grammar_text_rule[0].trim();
            //get the actual lsh word (ignore the "var")
            lsh = lsh.split("var")[1].trim()

            var rsh : string = grammar_text_rule[1].trim();
            //TODO::
            //now, need to split up the rsh into both its compound and optional sections
            //compound thing are done in sequence
            //optional things are done with conditionals
            //check out the examples!!!
            /**     also, should we be building the function as a javascript string
                        and then evaluate its definition at the end? */

            //TODO::
            //after this anonymous function is generated???
            //then assign it to this.grammatical_functions[lsh]
        }
    }

    public parse(program_text : string) : void {
        this.lexer = new Lexer(program_text);
        this.current_lexeme = this.lexer.lex();
        while (this.current_lexeme.type != END_OF_INPUT){
            this.statement();
            this.current_lexeme = this.lexer.lex();
        }
    }
}
