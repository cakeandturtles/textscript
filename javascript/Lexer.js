var Lexeme = (function () {
    function Lexeme(type, value) {
        this.type = type;
        this.value = value;
    }
    return Lexeme;
}());
var Lexer = (function () {
    function Lexer(program_txt) {
        this.input = new InputFile(program_txt);
    }
    Lexer.prototype.skipWhitespace = function () {
        var ch;
        ch = this.input.read();
        while (this.isWhitespace(ch) && ch != "\n") {
            ch = this.input.read();
        }
        this.input.backup();
    };
    Lexer.prototype.skipComment = function () {
        var ch;
        ch = this.input.read();
        if (ch === "#") {
            while (ch != "\n") {
                ch = this.input.read();
            }
        }
        this.input.backup();
    };
    Lexer.prototype.isWhitespace = function (ch) {
        return ch == " " || ch == "\t" || ch == '\n';
    };
    Lexer.prototype.isDigit = function (ch) {
        return !isNaN(Number(ch));
    };
    Lexer.prototype.isLetter = function (ch) {
        return ch.toLowerCase() != ch.toUpperCase();
    };
    Lexer.prototype.isKeyword = function (word) {
        var keywords = [
            "is", "if", "end", "else", "while", "do"
        ];
        for (var i = 0; i < keywords.length; i++) {
            if (keywords[i] === word)
                return true;
        }
        return false;
    };
    Lexer.prototype.lex = function () {
        var ch;
        this.skipWhitespace();
        this.skipComment();
        ch = this.input.read();
        if (this.input.failed)
            return new Lexeme(END_OF_INPUT);
        switch (ch) {
            case '(':
                return new Lexeme(OPAREN);
            case ')':
                return new Lexeme(CPAREN);
            case ',':
                return new Lexeme(COMMA);
            case '+':
                return new Lexeme(PLUS);
            case '-':
                return new Lexeme(MINUS);
            case '*':
                return new Lexeme(TIMES);
            case '/':
                return new Lexeme(DIVIDES);
            case '<':
                return new Lexeme(LESS_THAN);
            case '>':
                return new Lexeme(GREATER_THAN);
            case '=':
                return new Lexeme(ASSIGN);
            case '.':
                return new Lexeme(PERIOD);
            case '\n':
                return new Lexeme(NEWLINE);
            default:
                if (this.isDigit(ch)) {
                    this.input.backup();
                    return this.lexNumber();
                }
                else if (this.isLetter(ch)) {
                    this.input.backup();
                    return this.lexWord();
                }
                else if (ch == '"' || ch == "'") {
                    this.input.backup();
                    return this.lexString();
                }
        }
        return new Lexeme("UNKNOWN");
    };
    Lexer.prototype.lexNumber = function () {
        var num_string = "";
        var ch = this.input.read();
        while (this.isDigit(ch) && !this.input.failed) {
            num_string += ch;
            ch = this.input.read();
        }
        this.input.backup();
        return new Lexeme(NUMBER, Number(num_string));
    };
    Lexer.prototype.lexWord = function () {
        var word = "";
        var ch = this.input.read();
        while (!this.isWhitespace(ch) && !this.input.failed) {
            word += ch;
            ch = this.input.read();
        }
        this.input.backup();
        if (this.isKeyword(word))
            return new Lexeme(KEYWORD, word);
        else
            return new Lexeme(VARIABLE, word);
    };
    Lexer.prototype.lexString = function () {
        var string = "";
        var quote = this.input.read();
        var escaped = false;
        var ch = this.input.read();
        while ((ch !== quote || escaped) && !this.input.failed) {
            if (ch !== quote || escaped)
                string += ch;
            ch = this.input.read();
            if (ch === "\\" && !escaped)
                escaped = true;
            else
                escaped = false;
        }
        this.input.backup();
        return new Lexeme(STRING, string);
    };
    return Lexer;
}());
