class Lexeme {
    public left: Lexeme = undefined;
    public right: Lexeme = undefined;
    public precedence: number = 0;
    constructor(public type : string, public value?: any){
    }

    public toString(): string{
        return "type: " + this.type + ", value: " + this.value;
    }
}

class Lexer{
    private input : InputFile;
    private num_chars_in_lexeme: number = 0;
    constructor(program_txt : string){
        this.input = new InputFile(program_txt);
    }

    public getCharIndex() : number {
        return this.input.getCharIndex();
    }

    public getLineNum(): number {
        return this.input.getLineNum();
    }

    public getLine(): string {
        return this.input.getLine();
    }

    public getIndexOnLine(): number {
        return this.input.getIndexOnLine();
    }

    private skipWhitespace() : void
    {
        var ch : string;
        ch = this.next_char();
        //skip whitespace
        //(except newline as it is a syntactic piece of textscript)
        while (this.isWhitespace(ch) && !(ch === "\n") && !this.input.failed){
            ch = this.next_char();
        }
        this.backup_input();
    }

    private skipComment() : void{
        var ch : string;
        ch = this.next_char();
        if (ch === "#"){
            while (ch != "\n" && !this.input.failed){
                ch = this.next_char();
            }
        }
        this.backup_input();
    }

    private isWhitespace(ch : string) : boolean{
        return ch == " " || ch == "\t" || ch == '\n';
    }

    private isDigit(ch : string) : boolean{
        return ("0123456789".indexOf(ch) >= 0);
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

    private isKeyword(word : string): boolean{
        var lexeme = this.lexKeyword(word);
        if (lexeme.type === UNKNOWN)
            return false;
        return true;
    }

    private lexKeyword(word: string): Lexeme{
        if (word === "times") return new Lexeme(TIMES);
        if (word === "plus") return new Lexeme(PLUS);
        if (word === "minus") return new Lexeme(MINUS);
        if (word === "divided") return new Lexeme(DIVIDED);
        if (word === "by") return new Lexeme(BY);
        if (word === "to") return new Lexeme(TO);
        if (word === "the") return new Lexeme(THE);
        if (word === "mod") return new Lexeme(MOD);
        if (word === "log") return new Lexeme(LOG);
        if (word === "equals" || word === "equal") return new Lexeme(EQUAL_TO);
        if (word === "is") return new Lexeme(IS);
        if (word === "if") return new Lexeme(IF);
        if (word === "end") return new Lexeme(END);
        if (word === "else") return new Lexeme(ELSE);
        if (word === "while") return new Lexeme(WHILE);
        if (word === "do") return new Lexeme(DO);
        if (word === "or") return new Lexeme(OR);
        if (word === "and") return new Lexeme(AND);
        if (word === "not") return new Lexeme(NOT);
        if (word === "def") return new Lexeme(DEF);
        if (word === "return") return new Lexeme(RETURN);
        if (word === "with") return new Lexeme(WITH);
        if (word === "call") return new Lexeme(CALL);
        if (word === "print") return new Lexeme(PRINT);
        if (word === "class") return new Lexeme(CLASS);
        if (word === "start") return new Lexeme(START);
        if (word === "extends") return new Lexeme(EXTENDS);
        if (word === "when") return new Lexeme(WHEN);
        if (word === "created") return new Lexeme(CREATED);
        if (word === "new") return new Lexeme(NEW);
        if (word === "static") return new Lexeme(STATIC);
        if (word === "my") return new Lexeme(MY);
        if (word === "import") return new Lexeme(IMPORT);
        if (word === "as") return new Lexeme(AS);
        return new Lexeme(UNKNOWN);
    }

    private lexNumber() : Lexeme {
        var num_string: string = "";
        var ch: string = this.next_char();
        var first: boolean = true;
        var decimal: boolean = (ch == ".");
        var has_had_decimal: boolean = decimal;
        while ((this.isDigit(ch) || (ch == '.')) && !this.input.failed){
            num_string += ch;
            ch = this.next_char();
            first = false;

            //if there is a period at the end of a number (e.g. "123.") with no
            //following digits, count the "." as a statement separator
            //(by backing up now, and letting the lexer read it on its own)
            if (!this.isDigit(ch) && decimal){
                this.backup_input(true);
                break;
            }
            decimal = (ch == ".");

            //if there is more than one period on a number (e.g. "123.456.789")
            //than this is an invalid number!
            if (decimal && has_had_decimal){
                this.backup_input();
                //TODO:: syntax error?? or what?
                return new Lexeme(UNKNOWN);
            }
        }
        this.backup_input();
        return new Lexeme(NUMBER, Number(num_string));
    }

    private lexWord(): Lexeme {
        var word: string = "";
        var ch: string = this.next_char();
        var first: boolean = true;
        while (this.isWordLetter(ch, first) && !this.input.failed){
            word += ch;
            ch = this.next_char();
            first = false;
        }
        this.backup_input();

        if (this.isBoolean(word))
            return new Lexeme(BOOLEAN, this.toBoolean(word));
        if (this.isKeyword(word)){
            return this.lexKeyword(word);
        }
        else return new Lexeme(VARIABLE, word);
    }

    private lexString() : Lexeme {
        var string: string = "";
        //whether a single or double quote
        var quote: string = this.next_char();
        var escaped: boolean = false;
        var ch: string = this.next_char();

        //TODO:: i think this allows strings with newlines??
        while ((ch !== quote || escaped) && !this.input.failed){
            if (ch !== quote || escaped)
                string += ch;
            ch = this.next_char();

            //keep track of whether the escape character was used prior to the next character
            if (ch === "\\" && !escaped)
                escaped = true;
            else escaped = false;
        }

        this.backup_input();
        return new Lexeme(STRING, string);
    }

    //backs up the input by the number of characters in the last lexeme
    //note, cannot back up more than once without relexing
    public backup(): void{
        print("NUM: " + this.num_chars_in_lexeme);
        for (let i = 0; i < this.num_chars_in_lexeme; i++){
            this.backup_input();
        }
    }

    private next_char(): string{
        var ch: string = this.input.read();
        this.num_chars_in_lexeme++;
        return ch;
    }

    private backup_input(reset_failed = false): void{
        this.num_chars_in_lexeme--;
        this.input.backup(reset_failed);
    }

    public lex(): Lexeme
    {
        var ch : string;
        this.skipWhitespace();
        this.skipComment();

        this.num_chars_in_lexeme = 0;

        ch = this.next_char();
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
                ch = this.next_char();
                if (ch == "=") return new Lexeme(PLUS_EQUALS);
                if (ch == "+") return new Lexeme(PLUS_PLUS);
                this.backup_input();
                return new Lexeme(PLUS);
            case '-':
                //check for -= and --
                ch = this.next_char();
                if (ch == "=") return new Lexeme(MINUS_EQUALS);
                if (ch == "-") return new Lexeme(MINUS_MINUS);
                this.backup_input();
                return new Lexeme(MINUS);
            case '*':
                //check for *= and **
                ch = this.next_char();
                if (ch == "=") return new Lexeme(TIMES_EQUALS);
                if (ch == "*"){
                    //check for **=
                    ch = this.next_char();
                    if (ch == "=") return new Lexeme(EXPONENT_EQUALS);
                    this.backup_input();
                    return new Lexeme(EXPONENT);
                }
                this.backup_input();
                return new Lexeme(TIMES);
            case '/':
                //check for /=
                ch = this.next_char();
                if (ch == "=") return new Lexeme(DIVIDED_BY_EQUALS);
                this.backup_input();
                return new Lexeme(DIVIDED_BY);
            case '%':
                //check for %=
                ch = this.next_char();
                if (ch == "=") return new Lexeme(MOD_EQUALS);
                this.backup_input();
                return new Lexeme(MOD);
            case '<':
                //check for <=
                ch = this.next_char();
                if (ch == "=") return new Lexeme(LESS_THAN_EQUAL);
                this.backup_input();
                return new Lexeme(LESS_THAN);
            case '>':
                //check for >=
                ch = this.next_char();
                if (ch == "=") return new Lexeme(GREATER_THAN_EQUAL);
                this.backup_input();
                return new Lexeme(GREATER_THAN);
            case '=':
                //check for ==
                ch = this.next_char();
                if (ch == "=") return new Lexeme(EQUAL_TO);
                this.backup_input();
                return new Lexeme(IS);
            case '&':
                //check for &&
                ch = this.next_char();
                if (ch == '&') return new Lexeme(AND);
                this.backup_input();
                return new Lexeme(BITWISE_AND);
            case '|':
                //check for ||
                ch = this.next_char();
                if (ch == '|') return new Lexeme(OR);
                this.backup_input();
                return new Lexeme(BITWISE_OR);
            case '^':
                return new Lexeme(BITWISE_XOR);
            case '~':
                return new Lexeme(BITWISE_NOT);
            case '!':
                return new Lexeme(NOT);
            case '.':
                //TODO:: ... ?
                //check for .012 non digit prepended decimals
                ch = this.next_char();
                this.backup_input();
                //break so it will be caught by the number checker below
                if (this.isDigit(ch)) break;
                return new Lexeme(PERIOD);
            case '\n':
                return new Lexeme(NEWLINE);
        }
        //multi-character tokens

        //if starting with a digit!! (means this is a number value)
        //also allow a decimal in a number ('.' as first character)
        if (this.isDigit(ch) || ch == "."){
            this.backup_input();
            return this.lexNumber();
        }
        //if starting with a word letter
        //this can be variables (support for a-z,emoji,_)
        //this can be keywords
        //this can be boolean values??
        else if (this.isWordLetter(ch, true)){
            this.backup_input();
            return this.lexWord();
        }
        else if (ch == '"' || ch == "'"){
            this.backup_input();
            return this.lexString();
        }

        return new Lexeme("UNKNOWN");
    }
}
