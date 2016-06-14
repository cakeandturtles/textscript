class Parser{
    protected current_lexeme: Lexeme;
    protected lexer: Lexer;
    protected root: Lexeme;

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

    public parse(program_text: string): Lexeme {
        this.is_valid_syntax = true;
        this.lexer = new Lexer(program_text);
        this.current_lexeme = this.lexer.lex();
        let i: number = 0;
        let prev_index: number = 0;
        var tree = new Lexeme(START);
        this.root = tree;
        while (this.current_lexeme.type != END_OF_INPUT){
            var statement = this.statement();
            let index: number = this.lexer.getCharIndex();

            if (index === prev_index){
                this.lexer.backup();
                this.syntaxErrorAtPosition();
                break;
            }
            tree.right = statement;
            tree = statement;

            i++;
            prev_index = index;
        }
        return this.root;
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

    private op_one_param(): Lexeme{
        if (this.check(MINUS)){
            var negative = this.match(MINUS, 15);
            negative.type = NEGATIVE;
            return negative;
        }
        if (this.check(NOT))
            return this.match(NOT, 15);
        if (this.check(BITWISE_NOT))
            return this.match(BITWISE_NOT, 15);
        if (this.check(LOG))
            return this.match(LOG, 15);
        this.fatal("operator expected!");
    }
    private op_one_paramPending(): boolean{
        return this.check(MINUS) || this.check(NOT) || this.check(BITWISE_NOT) || this.check(LOG);
    }

    private op_two_params(): Lexeme{
        //NOTE!: operators might have different precedences!!!
        // = second value passed to each match/function call that's returned
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
        if (this.check(LESS_THAN))
            return this.match(LESS_THAN, 11);
        if (this.check(LESS_THAN_EQUAL))
            return this.match(LESS_THAN_EQUAL, 11);
        if (this.check(GREATER_THAN))
            return this.match(GREATER_THAN, 11);
        if (this.check(GREATER_THAN_EQUAL))
            return this.match(GREATER_THAN_EQUAL, 11);
        if (this.check(EQUAL_TO))
            return this.match(EQUAL_TO, 10);
        if (this.check(NOT_EQUAL_TO))
            return this.match(NOT_EQUAL_TO, 10);
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
        this.fatal("operator expected!");
    }
    private op_two_paramsPending(): boolean{
        return this.exponentPending() || this.check(TIMES) || this.divided_byPending() ||
               this.check(MOD) || this.check(PLUS) || this.check(MINUS) || this.check(LESS_THAN) ||
               this.check(LESS_THAN_EQUAL) || this.check(GREATER_THAN) || this.check(GREATER_THAN_EQUAL) ||
               this.check(EQUAL_TO) || this.check(NOT_EQUAL_TO) || this.check(BITWISE_AND) ||
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
        this.fatal("exponent expected!");
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
        this.fatal("divided by expected!");
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
        if (this.check(NUMBER))
            return this.match(NUMBER);
        if (this.check(BOOLEAN))
            return this.match(BOOLEAN);
        if (this.check(STRING))
            return this.match(STRING);
        if (this.var_primaryPending())
            return this.var_primary();
        if (this.var_func_callPending())
            return this.var_func_call();
        if (this.list_primaryPending())
            return this.list_primary();
        if (this.dict_primaryPending())
            return this.dict_primary();
        if (this.func_primaryPending())
            return this.func_primary();
        if (this.event_handler_primaryPending())
            return this.event_handler_primary();
        if (this.new_obj_primaryPending())
            return this.new_obj_primary();
        this.fatal("primary expected!");
    }
    private primaryPending(): boolean{
        return this.check(NUMBER) || this.check(BOOLEAN) || this.check(STRING) ||
               this.var_primaryPending() || this.list_primaryPending() ||
               this.dict_primaryPending() || this.func_primaryPending() ||
               this.new_obj_primaryPending();
    }

    /************************ VAR PRIMARIES (and func calls) ************************/
    private opt_my(): Lexeme{
        if (this.check(MY)){
            return this.match(MY);
        }
        return undefined;
    }

    private var_primary(): Lexeme{
        var temp = this.opt_my();
        var tree = this.match(VARIABLE);
        tree.right = this.opt_obj_access();
        if (temp !== undefined){
            temp.right = tree;
            tree = temp;
        }
        return tree;
    }
    private var_primaryPending(): boolean{
        return this.check(VARIABLE);
    }

    private opt_obj_access(): Lexeme{
        if (this.check(APOSTROPHE_S)){
            var tree = this.match(APOSTROPHE_S);
            tree.right = this.match(VARIABLE);
            tree.right.right = this.opt_obj_access();
        }
        return undefined;
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
        if (this.check(WITH)){
            var tree = this.match(WITH);
            var expression = this.expression();
            var temp = this.opt_list_continuation();
            if (temp !== undefined){
                temp.left = expression;
                tree.right = temp;
            }else{
                tree.right = expression;
            }
            return tree;
        }
        return undefined;
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
        var tree = this.expression();
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
            var expression = this.expression();
            var temp = this.opt_list_continuation();
            if (temp !== undefined){
                temp.left = expression;
                tree.right = temp;
            }else{
                tree.right = expression;
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
        var temp = this.opt_static();
        if (temp !== undefined)
            tree = new Lexeme(STATIC_FUNC_DEF);

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

    private opt_static(): Lexeme{
        if (this.check(STATIC))
            return this.match(STATIC);
        return undefined;
    }

    private event_handler_primary(): Lexeme{
        var tree = this.match(WHEN);
        tree.left = this.match(CREATED);
        tree.left.right = this.opt_with_def();
        tree.right = this.block();
        return tree;
    }
    private event_handler_primaryPending(): boolean{
        return this.check(WHEN);
    }

    private opt_with_def(): Lexeme{
        if (this.check(WITH)){
            var tree = this.match(WITH);
            tree.right = this.parameter_def();
        }
        return undefined;
    }

    private parameter_def(): Lexeme{
        var variable = this.match(VARIABLE);
        if (this.check(IS)){
            var is = this.match(IS);
            var expression = this.expression();
            is.left = variable;
            is.right = expression;
            //x is 3

            //once you've set one default parameter value, all following parameters must have default value
            //to allow nonambiguous, intuitive evaluation of function calls
            var temp = this.opt_with_default_continuation();
            if (temp !== undefined){
                //temp = ", y is 3", "," is root
                temp.left = is;
                //temp = "x is 3, y is 3", "," is root
                return temp;
            }else{
                //is = "x is 3", "is" is root
                return is;
            }
        }else{
            //when a parameter with non default value is defined,
            //the following parameter can have a default value or not
            var temp = this.opt_with_def_continuation();
            if (temp !== undefined){
                //temp = ", y, z is 3", first "," is root
                temp.left = variable;
                //temp = "x, y, z is 3", first "," is root"
                return temp;
            }else{
                return variable;
            }
        }
    }

    private opt_with_def_continuation(): Lexeme{
        //each next parameter definition here can be either with or without default value
        this.opt_newline();
        if (this.check(COMMA)){
            var tree = this.match(COMMA);
            this.opt_newline();
            //by using parameter_def, it recursively goes through each parameter definition
            //since parameter def checks the optional continuations
            var parameter = this.parameter_def();
            tree.right = parameter;
            return tree;
        }
        return undefined;
    }

    private opt_with_default_continuation(): Lexeme{
        this.opt_newline();
        if (this.check(COMMA)){
            var tree = this.match(COMMA);
            this.opt_newline();
            var assignment = this.normal_assignment();
            var temp = this.opt_with_default_continuation();
            if (temp !== undefined){
                //temp = ", y is 3", "," is the root
                temp.left = assignment;
                //temp = "x is 3, y is 3", "," is the root
                tree.right = temp;
                return tree;
            }else{
                tree.right = assignment;
                return tree;
            }
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
        if (this.op_one_paramPending()){
            var op = this.op_one_param();
            var expression = this.expression();
            op.right = expression;
            return op;
        }
        this.fatal("expression expected!");
    }
    private expressionPending(): boolean{
        return this.check(OPAREN) || this.primaryPending();
    }

    private opt_expression(): Lexeme{
        if (this.expressionPending())
            return this.expression();
        return undefined;
    }

    private opt_expression_rhs(): Lexeme{
        if (this.op_two_paramsPending()){
            var op = this.op_two_params();
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

    /************************ ASSIGNMENT ************************/
    private assignment_statement(): Lexeme{
        var assignment = this.assignment();
        var tree = this.statement_end();
        tree.left = assignment;
        return tree;
    }
    private assignment_statementPending(): boolean{
        return this.assignmentPending();
    }

    private assignment(): Lexeme{
        var variable = this.var_primary();
        var assignment_op = this.assignment_op();
        assignment_op.left = variable;
        assignment_op.right = this.expression();
        return assignment_op;
    }
    private assignmentPending(): boolean{
        return this.check(VARIABLE);
    }

    private normal_assignment(): Lexeme{
        var variable = this.match(VARIABLE);
        var assignment = this.match(IS);
        var expression = this.expression();
        assignment.left = variable;
        assignment.right = expression;
        return assignment;
    }
    private normal_assignmentPending(): boolean{
        return this.check(VARIABLE);
    }

    private assignment_op(): Lexeme{
        if (this.check(IS))
            return this.match(IS);
        if (this.check(PLUS_EQUALS))
            return this.match(PLUS_EQUALS);
        if (this.check(MINUS_EQUALS))
            return this.match(MINUS_EQUALS);
        if (this.check(TIMES_EQUALS))
            return this.match(TIMES_EQUALS);
        if (this.check(DIVIDED_BY_EQUALS))
            return this.match(DIVIDED_BY_EQUALS);
        if (this.check(EXPONENT_EQUALS))
            return this.match(EXPONENT_EQUALS);
        if (this.check(MOD_EQUALS))
            return this.match(MOD_EQUALS);
        this.fatal("assignment operator expected!");
    }

    /************************ IF STATEMENTS ************************/
    private if_statement(): Lexeme{
        var if_ = this.match(IF);
        var if_test = new Lexeme(IF_TEST);
        if_.left = if_test;

        var boolean = this.expression();
        if_test.left = boolean;
        var block = this.block();
        if_test.right = block;
        var opt_else = this.opt_else();
        if_.right = opt_else;

        var statement_end = new Lexeme(NEWLINE);
        statement_end.left = if_;
        return statement_end;
    }
    private if_statementPending(): boolean{
        return this.check(IF);
    }

    private opt_else(): Lexeme{
        if (this.check(ELSE)){
            var else_ = this.match(ELSE);
            if (this.if_statementPending()){
                var if_ = this.if_statement();
                else_.right = if_;
                return else_;
            }
            if (this.blockPending()){
                var block = this.block();
                else_.right = block;
                return else_;
            }
            this.fatal("if or do expected!");
        }
        return undefined;
    }

    /************************ keyword STATEMENTS && BLOCK ************************/
    private block(): Lexeme{
        this.opt_newline();
        if (this.check(DO)){
            var do_ = this.match(DO);
            this.opt_newline();
            var statements = this.statement_list();
            this.opt_newline();
            var end_ = this.match(END);

            do_.left = statements;
            return do_;
        }else{
            var do_ = new Lexeme(DO);
            do_.left = this.statement();
            return do_;
        }
    }
    private blockPending(): boolean{
        this.opt_newline();
        return this.check(DO) || this.statementPending();
    }

    private while_statement(): Lexeme{
        var while_ = this.match(WHILE);
        var expression = this.expression();
        var block = this.block();
        while_.left = primary;
        while_.right = block;

        var statement_end = new Lexeme(NEWLINE);
        statement_end.left = while_;
        return statement_end;
    }
    private while_statementPending(): boolean{
        return this.check(WHILE);
    }

    private print_statement(): Lexeme{
        var print = this.match(PRINT);
        var expression = this.expression();
        print.right = expression;
        var statement_end = this.statement_end();
        statement_end.left = print;
        return statement_end;
    }
    private print_statementPending(): boolean{
        return this.check(PRINT);
    }

    private expression_statement(): Lexeme{
        var expression = this.opt_expression();
        var statement_end = this.statement_end();
        statement_end.left = expression;
        return statement_end;
    }
    private expression_statementPending(): boolean{
        return this.expressionPending();
    }

    private import_statement(): Lexeme{
        var import_ = this.match(IMPORT);
        var variable = this.match(VARIABLE);
        var opt_as = this.opt_as();
        import_.left = variable;
        import_.right = opt_as;

        var statement_end = this.statement_end();
        statement_end.left = import_;
        return statement_end;
    }
    private import_statementPending(): boolean{
        return this.check(IMPORT);
    }

    private opt_as(): Lexeme{
        if (this.check(as_)){
            var as_ = this.match(AS);
            var variable = this.match(VARIABLE);
            as_.left = variable;
            return as_;
        }
        return undefined;
    }

    /************************ CLASS DEF STATEMENTS ************************/
    private class_def_statement(): Lexeme{
        var class_ = this.class_primary();
        var statement_end = this.statement_end();
        statement_end.left = class_;
        return statement_end;
    }
    private class_def_statementPending(): boolean{
        return this.class_primaryPending();
    }

    private class_primary(): Lexeme{
        var class_ = this.match(CLASS);
        class_.left = new Lexeme(DEF);
        var opt_name = this.opt_var();
        class_.left.left = opt_name;
        var opt_extends = this.opt_extends();
        class_.left.right = opt_extends;
        var class_body = this.block();
        class_.right = class_body;
        return class_;
    }
    private class_primaryPending(): boolean{
        return this.check(CLASS);
    }

    private opt_extends(): Lexeme{
        if (this.check(EXTENDS)){
            var tree = this.match(EXTENDS);
            tree.right = this.var_primary();
            return tree;
        }
        return undefined;
    }

    /************************ STATEMENTS ************************/
    private statement(): Lexeme{
        if (this.if_statementPending())
            return this.if_statement();
        if (this.while_statementPending())
            return this.while_statement();
        if (this.print_statementPending())
            return this.print_statement();
        if (this.assignment_statementPending())
            return this.assignment_statement();
        if (this.expression_statementPending())
            return this.expression_statement();
        if (this.class_def_statementPending())
            return this.class_def_statement();
        if (this.import_statementPending())
            return this.import_statement();
    }
    private statementPending(): boolean{
        return this.if_statementPending() || this.while_statementPending() ||
            this.print_statementPending() || this.assignment_statementPending() ||
            this.expression_statementPending() || this.class_def_statementPending() ||
            this.import_statementPending();
    }

    private statement_end(): Lexeme{
        if (this.check(PERIOD)){
            this.match(PERIOD);
            return new Lexeme(STATEMENT_END);
        }
        if (this.check(NEWLINE)){
            this.match(NEWLINE);
            return new Lexeme(STATEMENT_END);
        }
        //TODO:: will this break with the lexer?
        if (this.check(END_OF_INPUT)){
            this.match(END_OF_INPUT);
            return new Lexeme(STATEMENT_END);
        }
        this.fatal("statement end expected!");
    }

    private statement_list(): Lexeme{
        if (this.statementPending()){
            var statement = this.statement();
            statement.right = this.statement_list();
            return statement;
        }
        return undefined;
    }
}
