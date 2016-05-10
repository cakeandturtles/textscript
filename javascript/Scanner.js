function scanner(program_txt) {
    var token;
    var lexer = new Lexer(program_txt);
    token = lexer.lex();
    print(token);
    while (token.type != END_OF_INPUT) {
        token = lexer.lex();
        print(token);
    }
}
