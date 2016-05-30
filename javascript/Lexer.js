var Lexeme = (function () {
    function Lexeme(type, value) {
        this.type = type;
        this.value = value;
        this.left = undefined;
        this.right = undefined;
    }
    Lexeme.prototype.toString = function () {
        return "type: " + this.type + ", value: " + this.value;
    };
    return Lexeme;
}());
var Lexer = (function () {
    function Lexer(program_txt) {
        this.num_chars_in_lexeme = 0;
        this.input = new InputFile(program_txt);
    }
    Lexer.prototype.getCharIndex = function () {
        return this.input.getCharIndex();
    };
    Lexer.prototype.getLineNum = function () {
        return this.input.getLineNum();
    };
    Lexer.prototype.getLine = function () {
        return this.input.getLine();
    };
    Lexer.prototype.getIndexOnLine = function () {
        return this.input.getIndexOnLine();
    };
    Lexer.prototype.skipWhitespace = function () {
        var ch;
        ch = this.next_char();
        while (this.isWhitespace(ch) && !(ch === "\n") && !this.input.failed) {
            ch = this.next_char();
        }
        this.backup_input();
    };
    Lexer.prototype.skipComment = function () {
        var ch;
        ch = this.next_char();
        if (ch === "#") {
            while (ch != "\n" && !this.input.failed) {
                ch = this.next_char();
            }
        }
        this.backup_input();
    };
    Lexer.prototype.isWhitespace = function (ch) {
        return ch == " " || ch == "\t" || ch == '\n';
    };
    Lexer.prototype.isDigit = function (ch) {
        return ("0123456789".indexOf(ch) >= 0);
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
        var lexeme = this.lexKeyword(word);
        if (lexeme.type === UNKNOWN)
            return false;
        return true;
    };
    Lexer.prototype.lexKeyword = function (word) {
        if (word === "times")
            return new Lexeme(TIMES);
        if (word === "plus")
            return new Lexeme(PLUS);
        if (word === "minus")
            return new Lexeme(MINUS);
        if (word === "divided")
            return new Lexeme(DIVIDED);
        if (word === "by")
            return new Lexeme(BY);
        if (word === "to")
            return new Lexeme(TO);
        if (word === "the")
            return new Lexeme(THE);
        if (word === "mod")
            return new Lexeme(MOD);
        if (word === "log")
            return new Lexeme(LOG);
        if (word === "equals" || word === "equal")
            return new Lexeme(EQUAL_TO);
        if (word === "is")
            return new Lexeme(IS);
        if (word === "if")
            return new Lexeme(IF);
        if (word === "end")
            return new Lexeme(END);
        if (word === "else")
            return new Lexeme(ELSE);
        if (word === "while")
            return new Lexeme(WHILE);
        if (word === "do")
            return new Lexeme(DO);
        if (word === "or")
            return new Lexeme(OR);
        if (word === "and")
            return new Lexeme(AND);
        if (word === "not")
            return new Lexeme(NOT);
        if (word === "def")
            return new Lexeme(DEF);
        if (word === "return")
            return new Lexeme(RETURN);
        if (word === "with")
            return new Lexeme(WITH);
        if (word === "call")
            return new Lexeme(CALL);
        if (word === "print")
            return new Lexeme(PRINT);
        return new Lexeme(UNKNOWN);
    };
    Lexer.prototype.lexNumber = function () {
        var num_string = "";
        var ch = this.next_char();
        var first = true;
        var decimal = (ch == ".");
        var has_had_decimal = decimal;
        while ((this.isDigit(ch) || (ch == '.')) && !this.input.failed) {
            num_string += ch;
            ch = this.next_char();
            first = false;
            if (!this.isDigit(ch) && decimal) {
                this.backup_input(true);
                break;
            }
            decimal = (ch == ".");
            if (decimal && has_had_decimal) {
                this.backup_input();
                return new Lexeme(UNKNOWN);
            }
        }
        this.backup_input();
        return new Lexeme(NUMBER, Number(num_string));
    };
    Lexer.prototype.lexWord = function () {
        var word = "";
        var ch = this.next_char();
        var first = true;
        while (this.isWordLetter(ch, first) && !this.input.failed) {
            word += ch;
            ch = this.next_char();
            first = false;
        }
        this.backup_input();
        if (this.isBoolean(word))
            return new Lexeme(BOOLEAN, this.toBoolean(word));
        if (this.isKeyword(word)) {
            return this.lexKeyword(word);
        }
        else
            return new Lexeme(VARIABLE, word);
    };
    Lexer.prototype.lexString = function () {
        var string = "";
        var quote = this.next_char();
        var escaped = false;
        var ch = this.next_char();
        while ((ch !== quote || escaped) && !this.input.failed) {
            if (ch !== quote || escaped)
                string += ch;
            ch = this.next_char();
            if (ch === "\\" && !escaped)
                escaped = true;
            else
                escaped = false;
        }
        this.backup_input();
        return new Lexeme(STRING, string);
    };
    Lexer.prototype.backup = function () {
        print("NUM: " + this.num_chars_in_lexeme);
        for (var i = 0; i < this.num_chars_in_lexeme; i++) {
            this.backup_input();
        }
    };
    Lexer.prototype.next_char = function () {
        var ch = this.input.read();
        this.num_chars_in_lexeme++;
        return ch;
    };
    Lexer.prototype.backup_input = function (reset_failed) {
        if (reset_failed === void 0) { reset_failed = false; }
        this.num_chars_in_lexeme--;
        this.input.backup(reset_failed);
    };
    Lexer.prototype.lex = function () {
        var ch;
        this.skipWhitespace();
        this.skipComment();
        this.num_chars_in_lexeme = 0;
        ch = this.next_char();
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
                ch = this.next_char();
                if (ch == "=")
                    return new Lexeme(PLUS_EQUALS);
                if (ch == "+")
                    return new Lexeme(PLUS_PLUS);
                this.backup_input();
                return new Lexeme(PLUS);
            case '-':
                ch = this.next_char();
                if (ch == "=")
                    return new Lexeme(MINUS_EQUALS);
                if (ch == "-")
                    return new Lexeme(MINUS_MINUS);
                this.backup_input();
                return new Lexeme(MINUS);
            case '*':
                ch = this.next_char();
                if (ch == "=")
                    return new Lexeme(TIMES_EQUALS);
                if (ch == "*") {
                    ch = this.next_char();
                    if (ch == "=")
                        return new Lexeme(EXPONENT_EQUALS);
                    this.backup_input();
                    return new Lexeme(EXPONENT);
                }
                this.backup_input();
                return new Lexeme(TIMES);
            case '/':
                ch = this.next_char();
                if (ch == "=")
                    return new Lexeme(DIVIDED_BY_EQUALS);
                this.backup_input();
                return new Lexeme(DIVIDED_BY);
            case '%':
                ch = this.next_char();
                if (ch == "=")
                    return new Lexeme(MOD_EQUALS);
                this.backup_input();
                return new Lexeme(MOD);
            case '<':
                ch = this.next_char();
                if (ch == "=")
                    return new Lexeme(LESS_THAN_EQUAL);
                this.backup_input();
                return new Lexeme(LESS_THAN);
            case '>':
                ch = this.next_char();
                if (ch == "=")
                    return new Lexeme(GREATER_THAN_EQUAL);
                this.backup_input();
                return new Lexeme(GREATER_THAN);
            case '=':
                ch = this.next_char();
                if (ch == "=")
                    return new Lexeme(EQUAL_TO);
                this.backup_input();
                return new Lexeme(ASSIGN);
            case '.':
                ch = this.next_char();
                this.backup_input();
                if (this.isDigit(ch))
                    break;
                return new Lexeme(PERIOD);
            case '\n':
                return new Lexeme(NEWLINE);
        }
        if (this.isDigit(ch) || ch == ".") {
            this.backup_input();
            return this.lexNumber();
        }
        else if (this.isWordLetter(ch, true)) {
            this.backup_input();
            return this.lexWord();
        }
        else if (ch == '"' || ch == "'") {
            this.backup_input();
            return this.lexString();
        }
        return new Lexeme("UNKNOWN");
    };
    return Lexer;
}());
