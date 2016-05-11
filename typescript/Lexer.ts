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
        return !isNaN(Number(ch)) && !this.isWhitespace(ch);
    }

    private isLetter(ch : string) : boolean{
        var code : number = ch.charCodeAt(0);
        //uppercase letters
        if (code >= 65 && code <= 90) return true;
        //lowercase letters
        if (code >= 97 && code <= 122) return true;
        //weird symbol letters
        if (code >= 128 && code <= 154) return true;
        //greek letters?
        if (code >= 224 && code <= 238) return true;
        return false;
    }

    private isWordLetter(ch : string, first : boolean) : boolean {
        if (this.isDigit(ch)) return !first; //don't allow numbers as first char of word
        if (this.isLetter(ch)) return true;
        if (ch === "_") return true;

        return false;
    }

    private toBoolean(word : string) : boolean {
        if (word === "false") return false;
        if (word === "true") return true;
        return null;
    }

    private isBoolean(word : string) : boolean{
        if (this.toBoolean(word) === null)
            return false;
        return true;
    }

    private isKeyword(word : string) : boolean{
        var keywords : [string] = [
            "is", "if", "end", "else", "while", "do", "or", "and"
        ];
        for (var i : number = 0; i < keywords.length; i++){
            if (keywords[i] === word) return true;
        }
        return false;
    }

    private lexNumber() : Lexeme {
        var num_string : string = "";
        var ch : string = this.input.read();
        var first : boolean = true;
        var decimal : boolean = (ch == ".");
        var has_had_decimal : boolean = decimal;
        while ((this.isDigit(ch) || (ch == '-' && first) || (ch == '.')) && !this.input.failed){
            num_string += ch;
            ch = this.input.read();
            first = false;

            //if there is a period at the end of a number (e.g. "123.") with no
            //following digits, count the "." as a statement separator
            //(by backing up now, and letting the lexer read it on its own)
            if (!this.isDigit(ch) && decimal){
                this.input.backup();
                break;
            }
            decimal = (ch == ".");

            //if there is more than one period on a number (e.g. "123.456.789")
            //than this is an invalid number!
            if (decimal && has_had_decimal){
                this.input.backup();
                //TODO:: syntax error?? or what?
                return new Lexeme(UNKNOWN);
            }
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

        if (this.isBoolean(word))
            return new Lexeme(BOOLEAN, this.toBoolean(word));
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
                //check for += and ++
                ch = this.input.read();
                if (ch == "=") return new Lexeme(PLUS_EQUALS);
                if (ch == "+") return new Lexeme(PLUS_PLUS);
                this.input.backup();
                return new Lexeme(PLUS);
            case '-':
                //check for negative number?
                ch = this.input.read();
                this.input.backup();
                //break so it will be caught by the number checker below
                if (this.isDigit(ch)) break;

                //check for -= and --
                ch = this.input.read();
                if (ch == "=") return new Lexeme(MINUS_EQUALS);
                if (ch == "-") return new Lexeme(MINUS_MINUS);
                this.input.backup();
                return new Lexeme(MINUS);
            case '*':
                //check for *=
                ch = this.input.read();
                if (ch == "=") return new Lexeme(TIMES_EQUALS);
                this.input.backup();
                return new Lexeme(TIMES);
            case '/':
                //check for /=
                ch = this.input.read();
                if (ch == "=") return new Lexeme(DIVIDED_BY_EQUALS);
                this.input.backup();
                return new Lexeme(DIVIDED_BY);
            case '<':
                //check for <=
                ch = this.input.read();
                if (ch == "=") return new Lexeme(LESS_THAN_EQUAL);
                this.input.backup();
                return new Lexeme(LESS_THAN);
            case '>':
                //check for >=
                ch = this.input.read();
                if (ch == "=") return new Lexeme(GREATER_THAN_EQUAL);
                this.input.backup();
                return new Lexeme(GREATER_THAN);
            case '=':
                //check for ==
                ch = this.input.read();
                if (ch == "=") return new Lexeme(EQUAL_TO);
                this.input.backup();
                return new Lexeme(ASSIGN);
            case '.':
                //TODO:: ... ?
                //check for .012 non digit prepended decimals
                ch = this.input.read();
                this.input.backup();
                //break so it will be caught by the number checker below
                if (this.isDigit(ch)) break;
                return new Lexeme(PERIOD);
            case '\n':
                return new Lexeme(NEWLINE);
        }
        //multi-character tokens

        //if starting with a digit!! (means this is a number value)
        //also allow negative numbers ('-' as first character)
        //also allow a decimal in a number ('.')
        if (this.isDigit(ch) || ch == "-" || ch == "."){
            this.input.backup();
            return this.lexNumber();
        }
        //if starting with a word letter
        //this can be variables (support for a-z,emoji,_)
        //this can be keywords
        //this can be boolean values??
        else if (this.isWordLetter(ch, true)){
            this.input.backup();
            return this.lexWord();
        }
        else if (ch == '"' || ch == "'"){
            this.input.backup();
            return this.lexString();
        }

        return new Lexeme("UNKNOWN");
    }
}
