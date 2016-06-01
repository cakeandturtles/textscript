class Parser{
    protected current_lexeme: Lexeme;
    protected lexer: Lexer;
    protected grammatical_functions: { [id: string] : Function};

    protected is_valid_syntax: boolean = true;

    constructor(){
    }

    protected fatal(error: string): void{
        print(error);
        this.current_lexeme = new Lexeme(END_OF_INPUT);
        this.is_valid_syntax = false;
    }

    protected check(type: string): boolean {
        return this.current_lexeme.type === type;
    }
    private advance(): Lexeme {
        var old_lexeme = this.current_lexeme;
        this.current_lexeme = this.lexer.lex();
        return old_lexeme;
    }
    protected match(type: string): Lexeme {
        if (this.check(type)){
            return this.advance();
        }
        this.fatal("parse error: looking for " + type + ", found " +
                   this.current_lexeme.type + " instead\n");
        return undefined;
    }

    public parse(program_text: string): void {
        this.is_valid_syntax = true;
        this.lexer = new Lexer(program_text);
        this.current_lexeme = this.lexer.lex();
        let i: number = 0;
        let prev_index: number = 0;
        while (this.current_lexeme.type != END_OF_INPUT){
            this.statement();
            let index: number = this.lexer.getCharIndex();

            if (index === prev_index){
                this.lexer.backup();
                this.syntaxErrorAtPosition();
                break;
            }

            i++;
            prev_index = index;
            print("number of statements: " + i);
        }

        if (this.is_valid_syntax){
            alert("good syntax");
        }else alert("bad syntax");
    }

    private syntaxErrorAtPosition(): void{
        let msg: string = "";
        let err_index = this.lexer.getIndexOnLine();

        msg += "on line " + (this.lexer.getLineNum() + 1);
        msg += "\n\t" + this.lexer.getLine();
        msg += "\n\t";
        for (let j = 0; j < err_index; j++){
            msg += " ";
        }
        msg += "^";
        msg += "\nsyntax error: invalid syntax";
        this.fatal(msg);
    }

    /********************* OPERATORS ******************************************/

    private opt_newline(): Lexeme{
        if (this.check(NEWLINE)){
            var tree = this.match(NEWLINE);
            tree.right = this.opt_newline();
            return tree;
        }
        return undefined;
    }

    private op0(): Lexeme{
        if (this.check(NOT))
            return this.match(NOT);
        if (this.check(BITWISE_NOT))
            return this.match(BITWISE_NOT);
    }
    private op1(): Lexeme{
        return this.exponent();
    }
    private op2(): Lexeme{
        if (this.check(TIMES))
            return this.match(TIMES);
        if (this.divided_byPending())
            return this.divided_by();
        if (this.check(MOD))
            return this.match(MOD);
    }
    private op3(): Lexeme{
        if (this.check(PLUS))
            return this.match(PLUS);
        if (this.check(MINUS))
            return this.match(MINUS);
    }
    private op4(): Lexeme{
        return this.match(BITWISE_AND);
    }
    private op5(): Lexeme{
        return this.match(BITWISE_XOR);
    }
    private op6(): Lexeme{
        return this.match(BITWISE_OR);
    }
    private op7(): Lexeme{
        return this.match(AND);
    }
    private op8(): Lexeme{
        return this.match(OR);
    }

    private exponent(): Lexeme{
        if (this.check(EXPONENT))
            return this.match(EXPONENT);
        if (this.check(TO)){
            this.match(TO);
            this.match(THE);
            return new Lexeme(EXPONENT);
        }
    }

    private divided_by(): Lexeme{
        if (this.check(DIVIDED_BY))
            return this.match(DIVIDED_BY);
        if (this.check(DIVIDED)){
            this.match(DIVIDED);
            this.opt_by();
            return new Lexeme(DIVIDED_BY);
        }
    }
    private divided_byPending(): boolean{
        return this.check(DIVIDED_BY) || this.check(DIVIDED);
    }

    private opt_by(): Lexeme{
        if (this.check(BY)){
            this.match(BY);
        }
        return undefined;
    }

    /********************* PRIMARIES ******************************************/
    private primary(): Lexeme{
        if (this.num_primaryPending())
            return this.num_primary();
        if (this.check(BOOLEAN))
            return this.match(BOOLEAN);
        if (this.check(STRING))
            return this.match(STRING);
        if (this.var_primaryPending())
            return this.var_primary();
        if (this.list_primaryPending())
            return this.list_primary();
        if (this.dict_primaryPending())
            return this.dict_primary();
        if (this.func_primaryPending())
            return this.func_primary();
        if (this.new_obj_primaryPending())
            return this.new_obj_primary();
        if (this.expressionPending())
            return this.expression();
    }
    private primaryPending(): boolean{
        return this.num_primaryPending() || this.check(BOOLEAN) || this.check(STRING) ||
               this.var_primaryPending() || this.list_primaryPending() ||
               this.dict_primaryPending() || this.func_primaryPending() ||
               this.new_obj_primaryPending() || this.expressionPending();
    }

    private num_primary(): Lexeme{
        if (this.check(NUMBER))
            return this.match(NUMBER);
        if (this.check(MINUS)){
            var tree = this.match(MINUS);
            tree.type = NEGATIVE;
            tree.right = this.match(NUMBER);
            return tree;
        }
    }
    private num_primaryPending(): boolean{
        return this.check(NUMBER) || this.check(MINUS);
    }

    /************************ VAR PRIMARIES (and func calls) ************************/

    private var_primary(): Lexeme{
        if (this.check(VARIABLE)){
            var tree = this.match(VARIABLE);
            tree.right = this.opt_var();
            return tree;
        }
        if (this.var_func_callPending()){
            return this.var_func_call();
        }else{
            //TODO
            this.fatal("var primary expected!");
        }
    }
    private var_primaryPending(): boolean{
        return this.check(VARIABLE) || this.var_func_callPending();
    }

    private opt_var(): Lexeme{
        if (this.check(VARIABLE))
            return this.match(VARIABLE);
        return undefined;
    }

    private var_func_call(): Lexeme{
        var tree = this.match(CALL);
        tree.left = this.match(VARIABLE);
        tree.left.right = this.opt_var();
        tree.right = this.opt_with_call();
        return tree;
    }
    private var_func_callPending(): boolean{
        return this.check(CALL);
    }

    private opt_with_call(): Lexeme{
        var tree = this.match(WITH);
        var primary = this.primary();
        var temp = this.opt_list_continuation();
        if (temp !== undefined){
            temp.left = primary;
            tree.right = temp;
        }else{
            tree.right = primary;
        }
        return tree;
    }

    /************************ LISTS AND DICTS ************************/

    private list_primary(): Lexeme{
        this.match(OBRACKET);
        var tree = new Lexeme(LIST);
        tree.right = this.opt_list_body();
        this.match(CBRACKET);
        return tree;
    }
    private list_primaryPending(): boolean{
        return this.check(OBRACKET);
    }

    private opt_list_body(): Lexeme{
        if (this.list_bodyPending()){
            return this.list_body();
        }
        return undefined;
    }

    private list_body(): Lexeme{
        var tree = this.primary();
        var temp = this.opt_list_continuation();
        if (temp !== undefined){
            temp.left = tree;
            tree = temp;
        }
        return tree;
    }
    private list_bodyPending(): boolean{
        return this.primaryPending();
    }

    private opt_list_continuation(): Lexeme{
        this.opt_newline();
        if (this.check(COMMA)){
            var tree = this.match(COMMA);
            this.opt_newline();
            var primary = this.primary();
            var temp = this.opt_list_continuation();
            if (temp !== undefined){
                temp.left = primary;
                tree.right = temp;
            }else{
                tree.right = primary;
            }
            return tree;
        }
        return undefined;
    }

    private dict_primary(): Lexeme{
        this.match(OBRACE);
        var tree = new Lexeme(DICT);
        tree.right = this.opt_dict_body();
        this.match(CBRACE);
        return tree;
    }
    private dict_primaryPending(): boolean{
        return this.check(OBRACE);
    }

    private opt_dict_body(): Lexeme{
        if (this.dict_bodyPending()){
            return this.dict_body();
        }
        return undefined;
    }

    private dict_body(): Lexeme{
        var tree = this.normal_assignment();
        var temp = this.opt_dict_continuation();
        if (temp !== undefined){
            temp.left = tree;
            tree = temp;
        }
        return tree;
    }
    private dict_bodyPending(): boolean{
        return this.normal_assignmentPending();
    }

    private opt_dict_continuation(): Lexeme{
        this.opt_newline();
        if (this.check(COMMA)){
            var tree = this.match(COMMA);
            this.opt_newline();
            tree.right = this.dict_body();
            return tree;
        }
        return undefined;
    }

    /************************ FUNC DEF ************************/

    private func_primary(): Lexeme{
        var tree = new Lexeme(FUNC_DEF);
        var def = this.match(DEF);
        var opt_name = this.opt_var();
        var opt_with = this.opt_with_def();
        def.left = opt_name;
        def.right = opt_with;
        var block = this.block();

        tree.left = def
        tree.right = block;
        return tree;
    }
    private func_primaryPending(): boolean{
        return this.check(DEF);
    }

    private opt_with_def(): Lexeme{
        var tree = this.match(WITH);
        var variable = this.match(VARIABLE);
        return this.opt_with_def_or_default(tree, variable);
    }

    private opt_with_def_continuation(): Lexeme{
        this.opt_newline();
        if (this.check(COMMA)){
            var tree = this.match(COMMA);
            this.opt_newline();
            var variable = this.match(VARIABLE);
            return this.opt_with_def_or_default(tree, variable);
        }
        return undefined;
    }

    private opt_with_def_or_default(tree: Lexeme, variable: Lexeme): Lexeme{
        if (this.check(IS)){
            var is = this.match(IS);
            is.right = this.expression();
            is.left = variable;
            var temp = this.opt_with_default_continuation();
            if (temp !== undefined){
                temp.left = is;
                tree.right = temp;
            }else{
                tree.right = is;
            }
            return tree;
        }else{
            var temp = this.opt_with_def_continuation();
            if (temp !== undefined){
                temp.left = variable;
                tree.right = temp;
            }else{
                tree.right = variable;
            }
            return tree;
        }
    }

    private opt_with_default_continuation(): Lexeme{
        this.opt_newline();
        if (this.check(COMMA)){
            var tree = this.match(COMMA);
            this.opt_newline();
            var assignment = this.normal_assignment();
            var temp = this.opt_with_default_continuation();
            if (temp !== undefined){
                temp.left = assignment;
                tree.right = temp;
            }else{
                tree.right = assignment;
            }
            return tree;
        }
        return undefined;
    }

    private new_obj_primary(): Lexeme{
        var tree = this.match(NEW);
        tree.left = this.match(VARIABLE);
        tree.right = this.opt_with_call();
        return tree;
    }
    private new_obj_primaryPending(): boolean{
        return this.check(NEW);
    }

    /************************ EXPRESSIONS ************************/


    /************************ STATEMENTS ************************/
    private statement(): void{

    }
}
