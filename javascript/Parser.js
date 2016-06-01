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
    Parser.prototype.advance = function () {
        var old_lexeme = this.current_lexeme;
        this.current_lexeme = this.lexer.lex();
        return old_lexeme;
    };
    Parser.prototype.match = function (type) {
        if (this.check(type)) {
            return this.advance();
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
        while (this.current_lexeme.type != END_OF_INPUT) {
            this.statement();
            var index = this.lexer.getCharIndex();
            if (index === prev_index) {
                this.lexer.backup();
                this.syntaxErrorAtPosition();
                break;
            }
            i++;
            prev_index = index;
            print("number of statements: " + i);
        }
        if (this.is_valid_syntax) {
            alert("good syntax");
        }
        else
            alert("bad syntax");
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
    Parser.prototype.op0 = function () {
        if (this.check(NOT))
            return this.match(NOT);
        if (this.check(BITWISE_NOT))
            return this.match(BITWISE_NOT);
    };
    Parser.prototype.op1 = function () {
        return this.exponent();
    };
    Parser.prototype.op2 = function () {
        if (this.check(TIMES))
            return this.match(TIMES);
        if (this.divided_byPending())
            return this.divided_by();
        if (this.check(MOD))
            return this.match(MOD);
    };
    Parser.prototype.op3 = function () {
        if (this.check(PLUS))
            return this.match(PLUS);
        if (this.check(MINUS))
            return this.match(MINUS);
    };
    Parser.prototype.op4 = function () {
        return this.match(BITWISE_AND);
    };
    Parser.prototype.op5 = function () {
        return this.match(BITWISE_XOR);
    };
    Parser.prototype.op6 = function () {
        return this.match(BITWISE_OR);
    };
    Parser.prototype.op7 = function () {
        return this.match(AND);
    };
    Parser.prototype.op8 = function () {
        return this.match(OR);
    };
    Parser.prototype.exponent = function () {
        if (this.check(EXPONENT))
            return this.match(EXPONENT);
        if (this.check(TO)) {
            this.match(TO);
            this.match(THE);
            return new Lexeme(EXPONENT);
        }
    };
    Parser.prototype.divided_by = function () {
        if (this.check(DIVIDED_BY))
            return this.match(DIVIDED_BY);
        if (this.check(DIVIDED)) {
            this.match(DIVIDED);
            this.opt_by();
            return new Lexeme(DIVIDED_BY);
        }
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
    };
    Parser.prototype.primaryPending = function () {
        return this.num_primaryPending() || this.check(BOOLEAN) || this.check(STRING) ||
            this.var_primaryPending() || this.list_primaryPending() ||
            this.dict_primaryPending() || this.func_primaryPending() ||
            this.new_obj_primaryPending() || this.expressionPending();
    };
    Parser.prototype.num_primary = function () {
        if (this.check(NUMBER))
            return this.match(NUMBER);
        if (this.check(MINUS)) {
            var tree = this.match(MINUS);
            tree.type = NEGATIVE;
            tree.right = this.match(NUMBER);
            return tree;
        }
    };
    Parser.prototype.num_primaryPending = function () {
        return this.check(NUMBER) || this.check(MINUS);
    };
    Parser.prototype.var_primary = function () {
        if (this.check(VARIABLE)) {
            var tree = this.match(VARIABLE);
            tree.right = this.opt_var();
            return tree;
        }
        if (this.var_func_callPending()) {
            return this.var_func_call();
        }
        else {
            this.fatal("var primary expected!");
        }
    };
    Parser.prototype.var_primaryPending = function () {
        return this.check(VARIABLE) || this.var_func_callPending();
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
        var tree = this.match(WITH);
        var primary = this.primary();
        var temp = this.opt_list_continuation();
        if (temp !== undefined) {
            temp.left = primary;
            tree.right = temp;
        }
        else {
            tree.right = primary;
        }
        return tree;
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
        var tree = this.primary();
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
            var primary = this.primary();
            var temp = this.opt_list_continuation();
            if (temp !== undefined) {
                temp.left = primary;
                tree.right = temp;
            }
            else {
                tree.right = primary;
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
    Parser.prototype.opt_with_def = function () {
        var tree = this.match(WITH);
        var variable = this.match(VARIABLE);
        return this.opt_with_def_or_default(tree, variable);
    };
    Parser.prototype.opt_with_def_continuation = function () {
        this.opt_newline();
        if (this.check(COMMA)) {
            var tree = this.match(COMMA);
            this.opt_newline();
            var variable = this.match(VARIABLE);
            return this.opt_with_def_or_default(tree, variable);
        }
        return undefined;
    };
    Parser.prototype.opt_with_def_or_default = function (tree, variable) {
        if (this.check(IS)) {
            var is = this.match(IS);
            is.right = this.expression();
            is.left = variable;
            var temp = this.opt_with_default_continuation();
            if (temp !== undefined) {
                temp.left = is;
                tree.right = temp;
            }
            else {
                tree.right = is;
            }
            return tree;
        }
        else {
            var temp = this.opt_with_def_continuation();
            if (temp !== undefined) {
                temp.left = variable;
                tree.right = temp;
            }
            else {
                tree.right = variable;
            }
            return tree;
        }
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
            }
            else {
                tree.right = assignment;
            }
            return tree;
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
    Parser.prototype.statement = function () {
    };
    return Parser;
}());
