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
        while (ch == " " || ch == "\t") {
            ch = this.input.read();
        }
        this.input.backup();
    };
    Lexer.prototype.lex = function () {
        var ch;
        this.skipWhitespace();
        ch = this.input.read();
        if (this.input.failed)
            return new Lexeme(END_OF_INPUT);
        return new Lexeme("UNKNOWN", {});
    };
    return Lexer;
}());
