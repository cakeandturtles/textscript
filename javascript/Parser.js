var Parser = (function () {
    function Parser(grammar_text) {
        this.grammatical_functions = ParserGenerator.GenerateGrammaticalFunctions(grammar_text);
    }
    Parser.prototype.fatal = function (error) {
        alert(error);
    };
    Parser.prototype.check = function (type) {
        return this.current_lexeme.type === type;
    };
    Parser.prototype.advance = function () {
        this.current_lexeme = this.lexer.lex();
        print("\tadvanced: " + this.current_lexeme.type);
    };
    Parser.prototype.match = function (type) {
        this.matchNoAdvance(type);
        this.advance();
    };
    Parser.prototype.matchNoAdvance = function (type) {
        if (!this.check(type)) {
            this.fatal("syntax error: " + type);
        }
        else {
            print(type);
        }
    };
    Parser.prototype.parse = function (program_text) {
        this.lexer = new Lexer(program_text);
        this.current_lexeme = this.lexer.lex();
        var i = 0;
        while (this.current_lexeme.type != END_OF_INPUT) {
            this.statement();
            i++;
            print("number of statements: " + i);
        }
    };
    Parser.prototype.statement = function () {
        this.grammatical_functions["statement"](this);
    };
    return Parser;
}());
