var Parser = (function () {
    function Parser(grammar_text) {
        this.grammatical_functions = ParserGenerator.GenerateGrammaticalFunctions(grammar_text);
    }
    Parser.prototype.fatal = function (error) {
        alert(error);
    };
    Parser.prototype.check = function (type) {
        print('check');
        return this.current_lexeme.type === type;
    };
    Parser.prototype.advance = function () {
        print('advance');
        this.current_lexeme = this.lexer.lex();
    };
    Parser.prototype.match = function (type) {
        print('match');
        this.matchNoAdvance(type);
        this.advance();
    };
    Parser.prototype.matchNoAdvance = function (type) {
        if (!this.check(type)) {
            this.fatal("syntax error");
        }
        else {
            print(type);
        }
    };
    Parser.prototype.parse = function (program_text) {
        this.lexer = new Lexer(program_text);
        this.current_lexeme = this.lexer.lex();
        var i = 0;
        print(this.statement);
        while (this.current_lexeme.type != END_OF_INPUT) {
            print("number of statements: " + i);
            this.statement();
            this.current_lexeme = this.lexer.lex();
            i++;
        }
    };
    Parser.prototype.statement = function () {
        this.grammatical_functions["statement"]();
    };
    return Parser;
}());
