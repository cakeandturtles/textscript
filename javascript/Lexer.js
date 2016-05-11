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
        while (this.isWhitespace(ch) && ch != "\n" && !this.input.failed) {
            ch = this.input.read();
        }
        this.input.backup();
    };
    Lexer.prototype.skipComment = function () {
        var ch;
        ch = this.input.read();
        if (ch === "#") {
            while (ch != "\n" && !this.input.failed) {
                ch = this.input.read();
            }
        }
        this.input.backup();
    };
    Lexer.prototype.isWhitespace = function (ch) {
        return ch == " " || ch == "\t" || ch == '\n';
    };
    Lexer.prototype.isDigit = function (ch) {
        return !isNaN(Number(ch)) && !this.isWhitespace(ch);
    };
    Lexer.prototype.isLetter = function (ch) {
        var code = ch.charCodeAt(0);
        if (code >= 65 && code <= 90)
            return true;
        if (code >= 97 && code <= 122)
            return true;
        if (code >= 128 && code <= 154)
            return true;
        if (code >= 224 && code <= 238)
            return true;
        return false;
    };
    Lexer.prototype.isWordLetter = function (ch, first) {
        if (this.isDigit(ch))
            return !first;
        if (this.isLetter(ch))
            return true;
        if (ch === "_")
            return true;
        return false;
    };
    Lexer.prototype.toBoolean = function (word) {
        if (word === "false")
            return false;
        if (word === "true")
            return true;
        return null;
    };
    Lexer.prototype.isBoolean = function (word) {
        if (this.toBoolean(word) === null)
            return false;
        return true;
    };
    Lexer.prototype.isKeyword = function (word) {
        var keywords = [
            "is", "if", "end", "else", "while", "do", "or", "and"
        ];
        for (var i = 0; i < keywords.length; i++) {
            if (keywords[i] === word)
                return true;
        }
        return false;
    };
    Lexer.prototype.lexNumber = function () {
        var num_string = "";
        var ch = this.input.read();
        var first = true;
        var decimal = (ch == ".");
        var has_had_decimal = decimal;
        while ((this.isDigit(ch) || (ch == '-' && first) || (ch == '.')) && !this.input.failed) {
            num_string += ch;
            ch = this.input.read();
            first = false;
            if (!this.isDigit(ch) && decimal) {
                this.input.backup();
                break;
            }
            decimal = (ch == ".");
            if (decimal && has_had_decimal) {
                this.input.backup();
                return new Lexeme(UNKNOWN);
            }
        }
        this.input.backup();
        return new Lexeme(NUMBER, Number(num_string));
    };
    Lexer.prototype.lexWord = function () {
        var word = "";
        var ch = this.input.read();
        var first = true;
        while (this.isWordLetter(ch, first) && !this.input.failed) {
            word += ch;
            ch = this.input.read();
            first = false;
        }
        this.input.backup();
        if (this.isBoolean(word))
            return new Lexeme(BOOLEAN, this.toBoolean(word));
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
    Lexer.prototype.lex = function () {
        var ch;
        this.skipWhitespace();
        this.skipComment();
        ch = this.input.read();
        if (this.input.failed) {
            return new Lexeme(END_OF_INPUT);
        }
        switch (ch) {
            case '(':
                return new Lexeme(OPAREN);
            case ')':
                return new Lexeme(CPAREN);
            case '{':
                return new Lexeme(OBRACE);
            case '}':
                return new Lexeme(CBRACE);
            case '[':
                return new Lexeme(OBRACKET);
            case ']':
                return new Lexeme(CBRACKET);
            case ',':
                return new Lexeme(COMMA);
            case '+':
                ch = this.input.read();
                if (ch == "=")
                    return new Lexeme(PLUS_EQUALS);
                if (ch == "+")
                    return new Lexeme(PLUS_PLUS);
                this.input.backup();
                return new Lexeme(PLUS);
            case '-':
                ch = this.input.read();
                this.input.backup();
                if (this.isDigit(ch))
                    break;
                ch = this.input.read();
                if (ch == "=")
                    return new Lexeme(MINUS_EQUALS);
                if (ch == "-")
                    return new Lexeme(MINUS_MINUS);
                this.input.backup();
                return new Lexeme(MINUS);
            case '*':
                ch = this.input.read();
                if (ch == "=")
                    return new Lexeme(TIMES_EQUALS);
                this.input.backup();
                return new Lexeme(TIMES);
            case '/':
                ch = this.input.read();
                if (ch == "=")
                    return new Lexeme(DIVIDED_BY_EQUALS);
                this.input.backup();
                return new Lexeme(DIVIDED_BY);
            case '<':
                ch = this.input.read();
                if (ch == "=")
                    return new Lexeme(LESS_THAN_EQUAL);
                this.input.backup();
                return new Lexeme(LESS_THAN);
            case '>':
                ch = this.input.read();
                if (ch == "=")
                    return new Lexeme(GREATER_THAN_EQUAL);
                this.input.backup();
                return new Lexeme(GREATER_THAN);
            case '=':
                ch = this.input.read();
                if (ch == "=")
                    return new Lexeme(EQUAL_TO);
                this.input.backup();
                return new Lexeme(ASSIGN);
            case '.':
                ch = this.input.read();
                this.input.backup();
                if (this.isDigit(ch))
                    break;
                return new Lexeme(PERIOD);
            case '\n':
                return new Lexeme(NEWLINE);
        }
        if (this.isDigit(ch) || ch == "-" || ch == ".") {
            this.input.backup();
            return this.lexNumber();
        }
        else if (this.isWordLetter(ch, true)) {
            this.input.backup();
            return this.lexWord();
        }
        else if (ch == '"' || ch == "'") {
            this.input.backup();
            return this.lexString();
        }
        return new Lexeme("UNKNOWN");
    };
    return Lexer;
}());
