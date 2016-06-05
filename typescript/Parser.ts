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
    private advance(precedence: number): Lexeme {
        var old_lexeme = this.current_lexeme;
        this.current_lexeme = this.lexer.lex();
        old_lexeme.precedence = precedence;
        return old_lexeme;
    }
    protected match(type: string, precedence: number = 0): Lexeme {
        if (this.check(type)){
            return this.advance(precedence);
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

    private op(): Lexeme{
        //NOTE!: operators might have different precedences!!!
        // = second value passed to each match/function call that's returned
        if (this.check(NOT))
            return this.match(NOT, 15);
        if (this.check(BITWISE_NOT))
            return this.match(BITWISE_NOT, 15);
        if (this.exponentPending())
            return this.exponent(14);
        if (this.check(TIMES))
            return this.match(TIMES, 14);
        if (this.divided_byPending())
            return this.divided_by(14);
        if (this.check(MOD))
            return this.match(MOD, 14);
        if (this.check(PLUS))
            return this.match(PLUS, 13);
        if (this.check(MINUS))
            return this.match(MINUS, 13);
        if (this.check(BITWISE_AND))
            return this.match(BITWISE_AND, 9);
        if (this.check(BITWISE_XOR))
            return this.match(BITWISE_XOR, 8);
        if (this.check(BITWISE_OR))
            return this.match(BITWISE_OR, 7);
        if (this.check(AND))
            return this.match(AND, 6);
        if (this.check(OR))
            return this.match(OR, 5);
    }
    private opPending(): boolean{
        return this.check(NOT) || this.check(BITWISE_NOT) || this.exponentPending() ||
                this.check(TIMES) || this.divided_byPending() || this.check(MOD) ||
                this.check(PLUS) || this.check(MINUS) || this.check(BITWISE_AND) ||
                this.check(BITWISE_OR) || this.check(AND) || this.check(OR);
    }

    private exponent(precedence: number): Lexeme{
        if (this.check(EXPONENT))
            return this.match(EXPONENT, precedence);
        if (this.check(TO)){
            this.match(TO);
            this.match(THE);
            var tree = new Lexeme(EXPONENT);
            tree.precedence = precedence;
        }
    }
    private exponentPending(): boolean{
        return this.check(EXPONENT) || this.check(TO);
    }

    private divided_by(precedence: number): Lexeme{
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

    private expression(): Lexeme{
        if (this.check(OPAREN)){
            this.match(OPAREN);
            var tree = this.expression();
            //if we are in parenthesis, set highest order of precedence
            tree.precedence = 19;
            this.match(CPAREN);
            return tree;
        }
        if (this.primaryPending()){
            var tree = this.primary();
            var rhs = this.opt_expression_rhs();
            if (rhs !== undefined){
                //because we're dealing with operators with different precedence
                //the opt_expression_rhs may have returned a tree that doesn't
                //have a left subtree immediately empty
                //remember the primary
                var primary = tree;
                //set the tree to the expression rhs
                tree = rhs;
                //move through the rhs's left children until its free
                while (rhs.left !== undefined){
                    rhs = rhs.left;
                }
                //set the first empty left child to the primary
                rhs.left = primary;
                //this in effect allows 3*4+5 and similar to be parsed correctly
                //resulting in          +
                //                    *   5
                //                  3   4

                //instead of            *
                //                    3   +
                //                       4 5
            }
            return tree;
        }
    }
    private expressionPending(): boolean{
        return this.check(OPAREN) || this.primaryPending();
    }

    private opt_expression_rhs(): Lexeme{
        if (this.opPending()){
            var op = this.op();
            var expression = this.expression();
            //dealing with operators with different precedence!!!
            //if current operator has higher precedence
            //than we need to push it lower on the parse tree
            //(so that it will be evaluated sooner?)
            //(e.g. for (3*4+5)
            if (op.precedence > expression.precedence){
                //remember the primary on the left of the expression
                // e.g. the "4" in "4+5"
                var primary = expression.left;
                //set the current operator with higher precedence's right child
                //to the primary (e.g. "*"'s right child = 4)
                op.right = primary;
                //overwrite the primary we remembered on the expression's left child
                //to be the operator with the higher precedence
                //e.g. from _*(4+5) to (_*4)+5
                expression.left = op;
                //and finally, set the value that we will return to the expression
                //since the actual tree we would have returned is now its left child
                op = expression;
            }else{
                //otherwise if we're not dealing with higher precedence operator
                //just set the right child of the operator
                //(e.g. _+(4+5) is fine)
                op.right = expression;
            }
            return op;
        }
        return undefined;
    }


    /************************ STATEMENTS ************************/
    private statement(): void{

    }
}
