var Parser = (function () {
    function Parser() {
        var grammar_text = "var operator = PLUS || TIMES || MINUS || DIVIDED_BY";
        var grammar_text_rules = grammar_text.split(";");
        for (var i = 0; i < grammar_text_rules.length; i++) {
            var grammar_text_rule = grammar_text_rules[i].split("=");
            var lsh = grammar_text_rule[0].trim();
            lsh = lsh.split("var")[1].trim();
            var rsh = grammar_text_rule[1].trim();
        }
    }
    Parser.prototype.check = function (type) {
    };
    Parser.prototype.advance = function () { };
    Parser.prototype.match = function (type) {
    };
    Parser.prototype.matchNoAdvance = function () { };
    Parser.prototype.statement = function () { };
    Parser.prototype.operator = function () {
        if (this.check(PLUS)) {
            this.match(PLUS);
        }
        else if (this.check(TIMES)) {
            this.match(TIMES);
        }
        else if (this.check(MINUS)) {
            this.match(MINUS);
        }
        else if (this.check(DIVIDED_BY)) {
            this.match(DIVIDED_BY);
        }
    };
    Parser.prototype.parse = function (program_text) {
        this.lexer = new Lexer(program_text);
        this.current_lexeme = this.lexer.lex();
        while (this.current_lexeme.type != END_OF_INPUT) {
            this.statement();
            this.current_lexeme = this.lexer.lex();
        }
    };
    return Parser;
}());
