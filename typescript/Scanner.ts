function scanner(program_txt : string) : void
{
    var token : Lexeme;
    var lexer = new Lexer(program_txt);

    token = lexer.lex();
    while (token.type != END_OF_INPUT){
        print(token);
        token = lexer.lex();
    }
}
