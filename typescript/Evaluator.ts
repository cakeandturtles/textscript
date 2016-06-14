class Evaluator{
    protected fatal(error: string): void{
        print(error);
    }

    public match(tree: Lexeme, type: string){
        if (tree.type === type) return;

        this.fatal("EVALuation error: looking for " + type +", found " +
                    tree.type + " instead\n");
    }

    public eval(tree: Lexeme, env: Environment): any{
        if (tree === undefined) return;
        if (tree.type === "START")
            return this.eval(tree.right, env);

        return this.eval_statement_list(tree, env);
    }

    private getEnvValue(var_tree: Lexeme, env: Environment): any{
        var env_and_var_name = this.getEnvironmentAndVarNameFromVarTree(var_tree, env);
        env = env_and_var_name[0];
        var var_name = env_and_var_name[1];

        return env[var_name];
    }
    private setEnvValue(var_tree: Lexeme, value: any, env: Environment): void{
        var env_and_var_name = this.getEnvironmentAndVarNameFromVarTree(var_tree, env);
        env = env_and_var_name[0];
        var var_name = env_and_var_name[1];

        env[var_name] = value;
    }
    private getEnvironmentAndVarNameFromVarTree(var_tree: Lexeme, env: Environment){
        var is_my = var_tree.type === MY;
        if (is_my){
            var_tree = var_tree.right;
            //TODO:: something here (get the right environment in classes?
        }

        var var_name = var_tree.value;
        //loop until we get to the end of the object accessors
        while (var_tree.right !== undefined){
            //skip past the apostrophe_s and get the next variable name
            var_tree = var_tree.right.right;
            env = env[var_tree.value];
            var_name = var_tree.value;
        }
        return [env, var_name];
    }

    /********************************** OPERATORS******************************/
    private eval_op_one_param(tree: Lexeme, env: Environment): any{
        var type = tree.type;
        var right = this.eval_expression(tree.right, env);

        switch (type){
            case NEGATIVE:
                return -right;
            case NOT:
                return !right;
            case BITWISE_NOT:
                return ~right;
            case LOG:
                return Math.log(right);
        }
    }
    private op_one_paramPending(tree: Lexeme): boolean{
        return tree.type == NEGATIVE || tree.type == NOT || tree.type == BITWISE_NOT ||
               tree.type == LOG;
    }

    private eval_op_two_params(tree: Lexeme, env: Environment): any{
        var type = tree.type;
        var left = this.eval_expression(tree.left, env);
        var right = this.eval_expression(tree.right, env);

        switch (type){
            case EXPONENT:
                return Math.pow(left, right);
            case TIMES:
                return left * right;
            case DIVIDED_BY:
                return left / right;
            case MOD:
                return left % right;
            case PLUS:
                return left + right;
            case MINUS:
                return left - right;
            case LESS_THAN:
                return left < right;
            case LESS_THAN_EQUAL:
                return left <= right;
            case GREATER_THAN:
                return left > right;
            case GREATER_THAN_EQUAL:
                return left >= right;
            case EQUAL_TO:
                return left === right;
            case NOT_EQUAL_TO:
                return left !== right;
            case BITWISE_AND:
                return left & right;
            case BITWISE_OR:
                return left | right;
            case AND:
                return left && right;
            case OR:
                return left || right;
        }
    }
    private op_two_paramsPending(tree: Lexeme): boolean{
        var type = tree.type;
        return type == EXPONENT || type == TIMES || type == DIVIDED_BY || type == MOD ||
               type == PLUS || type == MINUS || type == LESS_THAN || type == LESS_THAN_EQUAL ||
               type == GREATER_THAN || type == GREATER_THAN_EQUAL || type == EQUAL_TO ||
               type == NOT_EQUAL_TO || type == BITWISE_AND || type == BITWISE_OR ||
               type == AND || type == OR;
    }

    /****************************PRIMARIES ************************************/
    private eval_primary(tree: Lexeme, env: Environment){
        if (tree.type == NUMBER || tree.type == BOOLEAN || tree.type == STRING)
            return tree.value;
        if (this.var_primaryPending(tree))
            return this.eval_var_primary(tree, env);
        if (this.var_func_callPending(tree))
            return this.eval_var_func_call(tree, env);
        if (this.list_primaryPending(tree))
            return this.eval_list_primary(tree, env);
        if (this.dict_primaryPending(tree))
            return this.eval_dict_primary(tree, env);
        if (this.func_primaryPending(tree))
            return this.eval_func_primary(tree, env);
        if (this.event_handler_primaryPending(tree))
            return this.eval_event_handler_primary(tree, env);
        if (this.new_obj_primaryPending(tree))
            return this.eval_new_obj_primary(tree, env);
        this.fatal("primary expected!");
    }
    private primaryPending(tree: Lexeme): boolean{
        var type = tree.type;
        return type == NUMBER || type == BOOLEAN || type == STRING ||
               this.var_primaryPending(tree) || this.list_primaryPending(tree) ||
               this.dict_primaryPending(tree) || this.func_primaryPending(tree) ||
               this.new_obj_primaryPending(tree);
    }

    private eval_num_primary(tree: Lexeme, env: Environment): any{
    }
    private num_primaryPending(tree: Lexeme){
        return tree.type == NUMBER || tree.type == NEGATIVE;
    }

    /********************************** EXPRESSIONS &&&&&&&&&&&&&&&&&&&&&&&&&&*/
    private eval_expression(tree: Lexeme, env: Environment): any{
        if (this.op_one_paramPending(tree)){
            return this.eval_op_one_param(tree, env);
        }
        else if (this.op_two_paramsPending(tree)){
            return this.eval_op_two_params(tree, env);
        }
        else{
            //just a normal primary
            return this.eval_primary(tree, env);
        }
    }

    /**************************ASSIGNMENT**************************************/
    private eval_assignment_statement(tree: Lexeme, env: Environment): any{
        this.eval_assignment(tree.left, env);
    }
    private assignment_statementPending(tree: Lexeme){
        if (tree.left !== undefined)
            return this.assignmentPending(tree.left);
        return false;
    }

    private eval_assignment(tree: Lexeme, env: Environment){
        var var_tree = tree.left;
        var expression_tree = tree.right;

        var val = this.getEnvValue(var_tree, env);
        var exp_val = this.eval_expression(expression_tree, env);
        switch (tree.type){
            case IS:
                return this.setEnvValue(var_tree, exp_val, env);
            case PLUS_EQUALS:
                return this.setEnvValue(var_tree, val + exp_val, env);
            case MINUS_EQUALS:
                return this.setEnvValue(var_tree, val - exp_val, env);
            case TIMES_EQUALS:
                return this.setEnvValue(var_tree, val * exp_val, env);
            case DIVIDED_BY_EQUALS:
                return this.setEnvValue(var_tree, val / exp_val, env);
            case EXPONENT_EQUALS:
                return this.setEnvValue(var_tree, Math.pow(val, exp_val), env);
            case MOD_EQUALS:
                return this.setEnvValue(var_tree, val % exp_val, env);
            default:
                this.fatal("assignment operator expected");
        }
    }
    private assignmentPending(tree: Lexeme){
        var type = tree.type;
        return type == IS || type == PLUS_EQUALS || type == MINUS_EQUALS ||
               type == TIMES_EQUALS || type == DIVIDED_BY_EQUALS || type == EXPONENT_EQUALS ||
               type == MOD_EQUALS;
    }

    /*************************IF STATEMENTS***********************************/
    private eval_if_statement(tree: Lexeme, env: Environment): any{
        tree = tree.left;

        var if_test = tree.left;
        var bool = this.eval_expression(if_test.left, env);

        //notice how evaluating an if statement is done by using an if statement...
        if (bool){
            return this.eval_block(if_test.right, env);
        }else{
            return this.eval_opt_else(tree.right, env);
        }
    }
    private if_statementPending(tree: Lexeme){
        if (tree.left !== undefined)
            return tree.left.type === IF;
        return false;
    }

    private eval_opt_else(tree: Lexeme, env: Environment){
        //if there is no else!!!
        if (tree === undefined) return;
        this.match(tree, ELSE);

        var if_or_block = tree.right;
        //if it's a block
        //if it's an additional if statement
        //(which would be               statement_end
        //                        if_statement
        if (this.if_statementPending(if_or_block)){
            return this.eval_if_statement(if_or_block, env);
        }
        if (this.blockPending(if_or_block)){
            return this.eval_block(if_or_block, env);
        }
    }

    /********************keyword STATEMENTS && BLOCK **************************/
    private eval_block(tree: Lexeme, env: Environment){
        this.match(tree, DO);

        var statement_list = tree.left;
        return this.eval_statement_list(statement_list, env);
    }
    private blockPending(tree: Lexeme){
        return tree.type === DO;
    }

    private eval_while_statement(tree: Lexeme, env: Environment){
        var while_ = tree.left;
        var exp_tree = while_.left;
        var block_tree = while_.right;
        while (this.eval_expression(exp_tree, env)){
            this.eval_block(block_tree, env);
        }
    }
    private while_statementPending(tree: Lexeme){
        if (tree.left !== undefined)
            return tree.left.type === WHILE;
        return false;
    }

    private eval_print_statement(tree: Lexeme, env:Environment){
        var print_ = tree.left;
        var exp_tree = print_.right;

        print(this.eval_expression(exp_tree, env));
    }
    private print_statementPending(tree: Lexeme){
        if (tree.left !== undefined)
            return tree.left.type === PRINT;
        return false;
    }

    private eval_import_statement(tree: Lexeme, env: Environment){
        var import_ = tree.left;
        var variable_tree = import_.left;
        var opt_as_tree = import_.right;

        var var_name = variable_tree.value;
        var as_name;
        if (opt_as_tree !== undefined)
            as_name = opt_as_tree.left;

        //TODO:: import is kind of like an assignment statement
        //for modules??
        //which are not yet implemented...
        //TODO:: maybe this can function similarly to class definition?? with static members
    }
    private import_statementPending(tree: Lexeme){
        if (tree.left !== undefined)
            return tree.left.type === IMPORT;
        return false;
    }

    /********************CLASS DEF PRIMARIES***********************************/


    /****************************STATEMENTS***********************************/
    private eval_statement(tree: Lexeme, env: Environment): any{
        this.match(tree, STATEMENT_END);
        //statement trees all start with a statement_end

        if (this.if_statementPending(tree))
            return this.eval_if_statement(tree, env);
        if (this.while_statementPending(tree))
            return this.eval_while_statement(tree, env);
        if (this.print_statementPending(tree))
            return this.eval_print_statement(tree, env);
        if (this.assignment_statementPending(tree))
            return this.eval_assignment_statement(tree, env);
        if (this.expression_statementPending(tree))
            return this.eval_expression_statement(tree, env);
        if (this.class_def_statementPending(tree))
            return this.eval_class_def_statement(tree, env);
        if (this.import_statementPending(tree))
            return this.eval_import_statement(tree, env);
    }
    private statementPending(tree: Lexeme){
        return this.if_statementPending(tree) || this.while_statementPending(tree) ||
               this.print_statementPending(tree) || this.assignment_statementPending(tree) ||
               this.primary_statementPending(tree) || this.class_def_statementPending(tree) ||
               this.import_statementPending(tree);
    }

    private eval_statement_list(tree: Lexeme, env: Environment): any{
        if (this.statementPending(tree)){
            this.eval_statement(tree, env);

            //eval the next statement
            this.eval_statement_list(tree.right, env);
        }
    }
}
