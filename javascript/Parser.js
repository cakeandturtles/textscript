var Parser = (function () {
    function Parser() {
        this.is_valid_syntax = true;
    }
    Parser.prototype.fatal = function (error) {
        print(error);
        this.current_lexeme = new Lexeme(END_OF_INPUT);
        this.is_valid_syntax = false;
    };
    Parser.prototype.check = function (type) {
        return this.current_lexeme.type === type;
    };
    Parser.prototype.advance = function (precedence) {
        var old_lexeme = this.current_lexeme;
        this.current_lexeme = this.lexer.lex();
        old_lexeme.precedence = precedence;
        return old_lexeme;
    };
    Parser.prototype.match = function (type, precedence) {
        if (precedence === void 0) { precedence = 0; }
        if (this.check(type)) {
            return this.advance(precedence);
        }
        this.fatal("parse error: looking for " + type + ", found " +
            this.current_lexeme.type + " instead\n");
        return undefined;
    };
    Parser.prototype.parse = function (program_text) {
        this.is_valid_syntax = true;
        this.lexer = new Lexer(program_text);
        this.current_lexeme = this.lexer.lex();
        var i = 0;
        var prev_index = 0;
        var tree = new Lexeme(START);
        this.root = tree;
        while (this.current_lexeme.type != END_OF_INPUT) {
            var statement = this.statement();
            var index = this.lexer.getCharIndex();
            if (index === prev_index) {
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
    };
    Parser.prototype.syntaxErrorAtPosition = function () {
        var msg = "";
        var err_index = this.lexer.getIndexOnLine();
        msg += "on line " + (this.lexer.getLineNum() + 1);
        msg += "\n\t" + this.lexer.getLine();
        msg += "\n\t";
        for (var j = 0; j < err_index; j++) {
            msg += " ";
        }
        msg += "^";
        msg += "\nsyntax error: invalid syntax";
        this.fatal(msg);
    };
    Parser.prototype.opt_newline = function () {
        if (this.check(NEWLINE)) {
            var tree = this.match(NEWLINE);
            tree.right = this.opt_newline();
            return tree;
        }
        return undefined;
    };
    Parser.prototype.op_one_param = function () {
        if (this.check(MINUS)) {
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
    };
    Parser.prototype.op_one_paramPending = function () {
        return this.check(MINUS) || this.check(NOT) || this.check(BITWISE_NOT) || this.check(LOG);
    };
    Parser.prototype.op_two_params = function () {
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
    };
    Parser.prototype.op_two_paramsPending = function () {
        return this.exponentPending() || this.check(TIMES) || this.divided_byPending() ||
            this.check(MOD) || this.check(PLUS) || this.check(MINUS) || this.check(LESS_THAN) ||
            this.check(LESS_THAN_EQUAL) || this.check(GREATER_THAN) || this.check(GREATER_THAN_EQUAL) ||
            this.check(EQUAL_TO) || this.check(NOT_EQUAL_TO) || this.check(BITWISE_AND) ||
            this.check(BITWISE_OR) || this.check(AND) || this.check(OR);
    };
    Parser.prototype.exponent = function (precedence) {
        if (this.check(EXPONENT))
            return this.match(EXPONENT, precedence);
        if (this.check(TO)) {
            this.match(TO);
            this.match(THE);
            var tree = new Lexeme(EXPONENT);
            tree.precedence = precedence;
        }
        this.fatal("exponent expected!");
    };
    Parser.prototype.exponentPending = function () {
        return this.check(EXPONENT) || this.check(TO);
    };
    Parser.prototype.divided_by = function (precedence) {
        if (this.check(DIVIDED_BY))
            return this.match(DIVIDED_BY);
        if (this.check(DIVIDED)) {
            this.match(DIVIDED);
            this.opt_by();
            return new Lexeme(DIVIDED_BY);
        }
        this.fatal("divided by expected!");
    };
    Parser.prototype.divided_byPending = function () {
        return this.check(DIVIDED_BY) || this.check(DIVIDED);
    };
    Parser.prototype.opt_by = function () {
        if (this.check(BY)) {
            this.match(BY);
        }
        return undefined;
    };
    Parser.prototype.primary = function () {
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
    };
    Parser.prototype.primaryPending = function () {
        return this.check(NUMBER) || this.check(BOOLEAN) || this.check(STRING) ||
            this.var_primaryPending() || this.list_primaryPending() ||
            this.dict_primaryPending() || this.func_primaryPending() ||
            this.new_obj_primaryPending();
    };
    Parser.prototype.opt_my = function () {
        if (this.check(MY)) {
            return this.match(MY);
        }
        return undefined;
    };
    Parser.prototype.var_primary = function () {
        var temp = this.opt_my();
        var tree = this.match(VARIABLE);
        tree.right = this.opt_obj_access();
        if (temp !== undefined) {
            temp.right = tree;
            tree = temp;
        }
        return tree;
    };
    Parser.prototype.var_primaryPending = function () {
        return this.check(VARIABLE);
    };
    Parser.prototype.opt_obj_access = function () {
        if (this.check(APOSTROPHE_S)) {
            var tree = this.match(APOSTROPHE_S);
            tree.right = this.match(VARIABLE);
            tree.right.right = this.opt_obj_access();
        }
        return undefined;
    };
    Parser.prototype.opt_var = function () {
        if (this.check(VARIABLE))
            return this.match(VARIABLE);
        return undefined;
    };
    Parser.prototype.var_func_call = function () {
        var tree = this.match(CALL);
        tree.left = this.match(VARIABLE);
        tree.left.right = this.opt_var();
        tree.right = this.opt_with_call();
        return tree;
    };
    Parser.prototype.var_func_callPending = function () {
        return this.check(CALL);
    };
    Parser.prototype.opt_with_call = function () {
        if (this.check(WITH)) {
            var tree = this.match(WITH);
            var expression = this.expression();
            var temp = this.opt_list_continuation();
            if (temp !== undefined) {
                temp.left = expression;
                tree.right = temp;
            }
            else {
                tree.right = expression;
            }
            return tree;
        }
        return undefined;
    };
    Parser.prototype.list_primary = function () {
        this.match(OBRACKET);
        var tree = new Lexeme(LIST);
        tree.right = this.opt_list_body();
        this.match(CBRACKET);
        return tree;
    };
    Parser.prototype.list_primaryPending = function () {
        return this.check(OBRACKET);
    };
    Parser.prototype.opt_list_body = function () {
        if (this.list_bodyPending()) {
            return this.list_body();
        }
        return undefined;
    };
    Parser.prototype.list_body = function () {
        var tree = this.expression();
        var temp = this.opt_list_continuation();
        if (temp !== undefined) {
            temp.left = tree;
            tree = temp;
        }
        return tree;
    };
    Parser.prototype.list_bodyPending = function () {
        return this.primaryPending();
    };
    Parser.prototype.opt_list_continuation = function () {
        this.opt_newline();
        if (this.check(COMMA)) {
            var tree = this.match(COMMA);
            this.opt_newline();
            var expression = this.expression();
            var temp = this.opt_list_continuation();
            if (temp !== undefined) {
                temp.left = expression;
                tree.right = temp;
            }
            else {
                tree.right = expression;
            }
            return tree;
        }
        return undefined;
    };
    Parser.prototype.dict_primary = function () {
        this.match(OBRACE);
        var tree = new Lexeme(DICT);
        tree.right = this.opt_dict_body();
        this.match(CBRACE);
        return tree;
    };
    Parser.prototype.dict_primaryPending = function () {
        return this.check(OBRACE);
    };
    Parser.prototype.opt_dict_body = function () {
        if (this.dict_bodyPending()) {
            return this.dict_body();
        }
        return undefined;
    };
    Parser.prototype.dict_body = function () {
        var tree = this.normal_assignment();
        var temp = this.opt_dict_continuation();
        if (temp !== undefined) {
            temp.left = tree;
            tree = temp;
        }
        return tree;
    };
    Parser.prototype.dict_bodyPending = function () {
        return this.normal_assignmentPending();
    };
    Parser.prototype.opt_dict_continuation = function () {
        this.opt_newline();
        if (this.check(COMMA)) {
            var tree = this.match(COMMA);
            this.opt_newline();
            tree.right = this.dict_body();
            return tree;
        }
        return undefined;
    };
    Parser.prototype.func_primary = function () {
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
        tree.left = def;
        tree.right = block;
        return tree;
    };
    Parser.prototype.func_primaryPending = function () {
        return this.check(DEF);
    };
    Parser.prototype.opt_static = function () {
        if (this.check(STATIC))
            return this.match(STATIC);
        return undefined;
    };
    Parser.prototype.event_handler_primary = function () {
        var tree = this.match(WHEN);
        tree.left = this.match(CREATED);
        tree.left.right = this.opt_with_def();
        tree.right = this.block();
        return tree;
    };
    Parser.prototype.event_handler_primaryPending = function () {
        return this.check(WHEN);
    };
    Parser.prototype.opt_with_def = function () {
        if (this.check(WITH)) {
            var tree = this.match(WITH);
            tree.right = this.parameter_def();
        }
        return undefined;
    };
    Parser.prototype.parameter_def = function () {
        var variable = this.match(VARIABLE);
        if (this.check(IS)) {
            var is = this.match(IS);
            var expression = this.expression();
            is.left = variable;
            is.right = expression;
            var temp = this.opt_with_default_continuation();
            if (temp !== undefined) {
                temp.left = is;
                return temp;
            }
            else {
                return is;
            }
        }
        else {
            var temp = this.opt_with_def_continuation();
            if (temp !== undefined) {
                temp.left = variable;
                return temp;
            }
            else {
                return variable;
            }
        }
    };
    Parser.prototype.opt_with_def_continuation = function () {
        this.opt_newline();
        if (this.check(COMMA)) {
            var tree = this.match(COMMA);
            this.opt_newline();
            var parameter = this.parameter_def();
            tree.right = parameter;
            return tree;
        }
        return undefined;
    };
    Parser.prototype.opt_with_default_continuation = function () {
        this.opt_newline();
        if (this.check(COMMA)) {
            var tree = this.match(COMMA);
            this.opt_newline();
            var assignment = this.normal_assignment();
            var temp = this.opt_with_default_continuation();
            if (temp !== undefined) {
                temp.left = assignment;
                tree.right = temp;
                return tree;
            }
            else {
                tree.right = assignment;
                return tree;
            }
        }
        return undefined;
    };
    Parser.prototype.new_obj_primary = function () {
        var tree = this.match(NEW);
        tree.left = this.match(VARIABLE);
        tree.right = this.opt_with_call();
        return tree;
    };
    Parser.prototype.new_obj_primaryPending = function () {
        return this.check(NEW);
    };
    Parser.prototype.expression = function () {
        if (this.check(OPAREN)) {
            this.match(OPAREN);
            var tree = this.expression();
            tree.precedence = 19;
            this.match(CPAREN);
            return tree;
        }
        if (this.primaryPending()) {
            var tree = this.primary();
            var rhs = this.opt_expression_rhs();
            if (rhs !== undefined) {
                var primary = tree;
                tree = rhs;
                while (rhs.left !== undefined) {
                    rhs = rhs.left;
                }
                rhs.left = primary;
            }
            return tree;
        }
        if (this.op_one_paramPending()) {
            var op = this.op_one_param();
            var expression = this.expression();
            op.right = expression;
            return op;
        }
        this.fatal("expression expected!");
    };
    Parser.prototype.expressionPending = function () {
        return this.check(OPAREN) || this.primaryPending();
    };
    Parser.prototype.opt_expression = function () {
        if (this.expressionPending())
            return this.expression();
        return undefined;
    };
    Parser.prototype.opt_expression_rhs = function () {
        if (this.op_two_paramsPending()) {
            var op = this.op_two_params();
            var expression = this.expression();
            if (op.precedence > expression.precedence) {
                var primary = expression.left;
                op.right = primary;
                expression.left = op;
                op = expression;
            }
            else {
                op.right = expression;
            }
            return op;
        }
        return undefined;
    };
    Parser.prototype.assignment_statement = function () {
        var assignment = this.assignment();
        var tree = this.statement_end();
        tree.left = assignment;
        return tree;
    };
    Parser.prototype.assignment_statementPending = function () {
        return this.assignmentPending();
    };
    Parser.prototype.assignment = function () {
        var variable = this.var_primary();
        var assignment_op = this.assignment_op();
        assignment_op.left = variable;
        assignment_op.right = this.expression();
        return assignment_op;
    };
    Parser.prototype.assignmentPending = function () {
        return this.check(VARIABLE);
    };
    Parser.prototype.normal_assignment = function () {
        var variable = this.match(VARIABLE);
        var assignment = this.match(IS);
        var expression = this.expression();
        assignment.left = variable;
        assignment.right = expression;
        return assignment;
    };
    Parser.prototype.normal_assignmentPending = function () {
        return this.check(VARIABLE);
    };
    Parser.prototype.assignment_op = function () {
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
    };
    Parser.prototype.if_statement = function () {
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
    };
    Parser.prototype.if_statementPending = function () {
        return this.check(IF);
    };
    Parser.prototype.opt_else = function () {
        if (this.check(ELSE)) {
            var else_ = this.match(ELSE);
            if (this.if_statementPending()) {
                var if_ = this.if_statement();
                else_.right = if_;
                return else_;
            }
            if (this.blockPending()) {
                var block = this.block();
                else_.right = block;
                return else_;
            }
            this.fatal("if or do expected!");
        }
        return undefined;
    };
    Parser.prototype.block = function () {
        this.opt_newline();
        if (this.check(DO)) {
            var do_ = this.match(DO);
            this.opt_newline();
            var statements = this.statement_list();
            this.opt_newline();
            var end_ = this.match(END);
            do_.left = statements;
            return do_;
        }
        else {
            var do_ = new Lexeme(DO);
            do_.left = this.statement();
            return do_;
        }
    };
    Parser.prototype.blockPending = function () {
        this.opt_newline();
        return this.check(DO) || this.statementPending();
    };
    Parser.prototype.while_statement = function () {
        var while_ = this.match(WHILE);
        var expression = this.expression();
        var block = this.block();
        while_.left = primary;
        while_.right = block;
        var statement_end = new Lexeme(NEWLINE);
        statement_end.left = while_;
        return statement_end;
    };
    Parser.prototype.while_statementPending = function () {
        return this.check(WHILE);
    };
    Parser.prototype.print_statement = function () {
        var print = this.match(PRINT);
        var expression = this.expression();
        print.right = expression;
        var statement_end = this.statement_end();
        statement_end.left = print;
        return statement_end;
    };
    Parser.prototype.print_statementPending = function () {
        return this.check(PRINT);
    };
    Parser.prototype.expression_statement = function () {
        var expression = this.opt_expression();
        var statement_end = this.statement_end();
        statement_end.left = expression;
        return statement_end;
    };
    Parser.prototype.expression_statementPending = function () {
        return this.expressionPending();
    };
    Parser.prototype.import_statement = function () {
        var import_ = this.match(IMPORT);
        var variable = this.match(VARIABLE);
        var opt_as = this.opt_as();
        import_.left = variable;
        import_.right = opt_as;
        var statement_end = this.statement_end();
        statement_end.left = import_;
        return statement_end;
    };
    Parser.prototype.import_statementPending = function () {
        return this.check(IMPORT);
    };
    Parser.prototype.opt_as = function () {
        if (this.check(as_)) {
            var as_ = this.match(AS);
            var variable = this.match(VARIABLE);
            as_.left = variable;
            return as_;
        }
        return undefined;
    };
    Parser.prototype.class_def_statement = function () {
        var class_ = this.class_primary();
        var statement_end = this.statement_end();
        statement_end.left = class_;
        return statement_end;
    };
    Parser.prototype.class_def_statementPending = function () {
        return this.class_primaryPending();
    };
    Parser.prototype.class_primary = function () {
        var class_ = this.match(CLASS);
        class_.left = new Lexeme(DEF);
        var opt_name = this.opt_var();
        class_.left.left = opt_name;
        var opt_extends = this.opt_extends();
        class_.left.right = opt_extends;
        var class_body = this.block();
        class_.right = class_body;
        return class_;
    };
    Parser.prototype.class_primaryPending = function () {
        return this.check(CLASS);
    };
    Parser.prototype.opt_extends = function () {
        if (this.check(EXTENDS)) {
            var tree = this.match(EXTENDS);
            tree.right = this.var_primary();
            return tree;
        }
        return undefined;
    };
    Parser.prototype.statement = function () {
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
    };
    Parser.prototype.statementPending = function () {
        return this.if_statementPending() || this.while_statementPending() ||
            this.print_statementPending() || this.assignment_statementPending() ||
            this.expression_statementPending() || this.class_def_statementPending() ||
            this.import_statementPending();
    };
    Parser.prototype.statement_end = function () {
        if (this.check(PERIOD)) {
            this.match(PERIOD);
            return new Lexeme(STATEMENT_END);
        }
        if (this.check(NEWLINE)) {
            this.match(NEWLINE);
            return new Lexeme(STATEMENT_END);
        }
        if (this.check(END_OF_INPUT)) {
            this.match(END_OF_INPUT);
            return new Lexeme(STATEMENT_END);
        }
        this.fatal("statement end expected!");
    };
    Parser.prototype.statement_list = function () {
        if (this.statementPending()) {
            var statement = this.statement();
            statement.right = this.statement_list();
            return statement;
        }
        return undefined;
    };
    return Parser;
}());
