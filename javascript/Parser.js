var Parser = (function () {
    function Parser(grammar_text) {
        this.is_valid_syntax = true;
        this.grammatical_functions = ParserGenerator.GenerateGrammaticalFunctions(grammar_text);
    }
    Parser.prototype.fatal = function (error) {
        print(error);
        this.current_lexeme = new Lexeme(END_OF_INPUT);
        this.is_valid_syntax = false;
    };
    Parser.prototype.check = function (type) {
        return this.current_lexeme.type === type;
    };
    Parser.prototype.advance = function () {
        this.current_lexeme = this.lexer.lex();
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
        this.is_valid_syntax = true;
        this.lexer = new Lexer(program_text);
        this.current_lexeme = this.lexer.lex();
        var i = 0;
        var prev_index = 0;
        while (this.current_lexeme.type != END_OF_INPUT) {
            this.statement();
            var index = this.lexer.getCharIndex();
            if (index === prev_index) {
                this.lexer.backup();
                this.syntaxErrorAtPosition();
                break;
            }
            i++;
            prev_index = index;
            print("number of statements: " + i);
        }
        if (this.is_valid_syntax) {
            alert("good syntax");
        }
        else
            alert("bad syntax");
    };
    Parser.prototype.syntaxErrorAtPosition = function () {
        var msg = "";
        var err_index = this.lexer.getIndexOnLine();
        msg += "on line " + (this.lexer.getLineNum() + 1);
        msg += "\n\t" + this.lexer.getLine();
        msg += "\n\t";
        for (var j = 0; j < err_index; j++) {
            msg += " ";
        }
        msg += "^";
        msg += "\nsyntax error: invalid syntax";
        this.fatal(msg);
    };
    Parser.prototype.statement = function () {
        this.grammatical_functions["statement"](this);
    };
    return Parser;
}());
