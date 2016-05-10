class Lexeme {
    constructor(public type : string, public value? : any){
    }
}

class Lexer{
    private input : InputFile;
    constructor(program_txt : string){
        this.input = new InputFile(program_txt);
    }

    private skipWhitespace() : void
    {
        var ch : string;
        ch = this.input.read();
        //skip whitespace, but not newline!!!
        //(because newline is important to code)
        while (this.isWhitespace(ch) && ch != "\n" && !this.input.failed){
            ch = this.input.read();
        }
        this.input.backup();
    }

    private skipComment() : void{
        var ch : string;
        ch = this.input.read();
        if (ch === "#"){
            while (ch != "\n" && !this.input.failed){
                ch = this.input.read();
            }
        }
        this.input.backup();
    }

    private isWhitespace(ch : string) : boolean{
        return ch == " " || ch == "\t" || ch == '\n';
    }

    private isDigit(ch : string) : boolean{
        return !isNaN(Number(ch));
    }

    private isLetter(ch : string) : boolean{
        return ch.toLowerCase() != ch.toUpperCase();
    }

    private isWordLetter(ch : string, first : boolean) : boolean {
        if (this.isWhitespace(ch))  return false;
        if (this.isDigit(ch)) return !first; //don't allow numbers as first char of word?
        if (this.isLetter(ch)) return true;
        if (ch === "_") return true;

        return false;
    }

    private isKeyword(word : string) : boolean{
        var keywords : [string] = [
            "is", "if", "end", "else", "while", "do"
        ];
        for (var i : number = 0; i < keywords.length; i++){
            if (keywords[i] === word) return true;
        }
        return false;
    }

    private lexNumber() : Lexeme {
        var num_string : string = "";
        var ch : string = this.input.read();
        while (this.isDigit(ch) && !this.input.failed){
            num_string += ch;
            ch = this.input.read();
        }
        this.input.backup();
        return new Lexeme(NUMBER, Number(num_string));
    }

    private lexWord() : Lexeme {
        var word : string = "";
        var ch : string = this.input.read();
        var first : boolean = true;
        while (this.isWordLetter(ch, first) && !this.input.failed){
            word += ch;
            ch = this.input.read();
            first = false;
        }
        this.input.backup();

        if (this.isKeyword(word))
            return new Lexeme(KEYWORD, word);
        else return new Lexeme(VARIABLE, word);
    }

    private lexString() : Lexeme {
        var string = "";
        //whether a single or double quote
        var quote : string = this.input.read();
        var escaped : boolean = false;
        var ch : string = this.input.read();

        //TODO:: i think this allows strings with newlines??
        while ((ch !== quote || escaped) && !this.input.failed){
            if (ch !== quote || escaped)
                string += ch;
            ch = this.input.read();

            //keep track of whether the escape character was used prior to the next character
            if (ch === "\\" && !escaped)
                escaped = true;
            else escaped = false;
        }

        this.input.backup();
        return new Lexeme(STRING, string);
    }

    public lex() : Lexeme
    {
        var ch : string;
        this.skipWhitespace();
        this.skipComment();

        ch = this.input.read();
        if (this.input.failed){
            return new Lexeme(END_OF_INPUT);
        }

        switch (ch){
            //single character tokens
            case '(':
                return new Lexeme(OPAREN);
            case ')':
                return new Lexeme(CPAREN);
            case ',':
                return new Lexeme(COMMA);
            case '+':
                //TODO:: ++, += ?
                return new Lexeme(PLUS);
            case '-':
                //TODO:: negative numbers?
                return new Lexeme(MINUS);
            case '*':
                return new Lexeme(TIMES);
            case '/':
                return new Lexeme(DIVIDES);
            case '<':
                //TODO:: <=
                return new Lexeme(LESS_THAN);
            case '>':
                //TODO:: >=
                return new Lexeme(GREATER_THAN);
            case '=':
                //TODO:: ==
                return new Lexeme(ASSIGN);
            case '.':
                //TODO:: ... ?
                return new Lexeme(PERIOD);

            case '\n':
                return new Lexeme(NEWLINE);

            default:
                //multi-character tokens

                //if a digit
                if (this.isDigit(ch)){
                    this.input.backup();
                    return this.lexNumber();
                }
                else if (this.isWordLetter(ch, true)){
                    this.input.backup();
                    return this.lexWord();
                }
                else if (ch == '"' || ch == "'"){
                    this.input.backup();
                    return this.lexString();
                }
        }

        return new Lexeme("UNKNOWN");
    }
}
