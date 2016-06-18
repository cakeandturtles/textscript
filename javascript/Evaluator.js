var Evaluator = (function () {
    function Evaluator() {
    }
    Evaluator.prototype.fatal = function (error) {
        print(error);
    };
    Evaluator.prototype.match = function (tree, type) {
        if (tree.type === type)
            return;
        this.fatal("EVALuation error: looking for " + type + ", found " +
            tree.type + " instead\n");
    };
    Evaluator.prototype.eval = function (tree, env) {
        if (tree === undefined)
            return;
        if (tree.type === "START")
            return this.eval(tree.right, env);
        return this.eval_statement_list(tree, env);
    };
    Evaluator.prototype.getEnvValue = function (var_tree, env) {
        var env_and_var_name = this.getEnvironmentAndVarNameFromVarTree(var_tree, env);
        env = env_and_var_name[0];
        var var_name = env_and_var_name[1];
        return env[var_name];
    };
    Evaluator.prototype.setEnvValue = function (var_tree, value, env) {
        var env_and_var_name = this.getEnvironmentAndVarNameFromVarTree(var_tree, env);
        env = env_and_var_name[0];
        var var_name = env_and_var_name[1];
        env[var_name] = value;
    };
    Evaluator.prototype.getEnvironmentAndVarNameFromVarTree = function (var_tree, env) {
        var is_my = var_tree.type === MY;
        if (is_my) {
            var_tree = var_tree.right;
        }
        var var_name = var_tree.value;
        while (var_tree.right !== undefined) {
            var_tree = var_tree.right.right;
            env = env[var_tree.value];
            var_name = var_tree.value;
        }
        return [env, var_name];
    };
    Evaluator.prototype.eval_op_one_param = function (tree, env) {
        var type = tree.type;
        var right = this.eval_expression(tree.right, env);
        switch (type) {
            case NEGATIVE:
                return -right;
            case NOT:
                return !right;
            case BITWISE_NOT:
                return ~right;
            case LOG:
                return Math.log(right);
        }
    };
    Evaluator.prototype.op_one_paramPending = function (tree) {
        return tree.type == NEGATIVE || tree.type == NOT || tree.type == BITWISE_NOT ||
            tree.type == LOG;
    };
    Evaluator.prototype.eval_op_two_params = function (tree, env) {
        var type = tree.type;
        var left = this.eval_expression(tree.left, env);
        var right = this.eval_expression(tree.right, env);
        switch (type) {
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
    };
    Evaluator.prototype.op_two_paramsPending = function (tree) {
        var type = tree.type;
        return type == EXPONENT || type == TIMES || type == DIVIDED_BY || type == MOD ||
            type == PLUS || type == MINUS || type == LESS_THAN || type == LESS_THAN_EQUAL ||
            type == GREATER_THAN || type == GREATER_THAN_EQUAL || type == EQUAL_TO ||
            type == NOT_EQUAL_TO || type == BITWISE_AND || type == BITWISE_OR ||
            type == AND || type == OR;
    };
    Evaluator.prototype.eval_primary = function (tree, env) {
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
    };
    Evaluator.prototype.primaryPending = function (tree) {
        var type = tree.type;
        return type == NUMBER || type == BOOLEAN || type == STRING ||
            this.var_primaryPending(tree) || this.list_primaryPending(tree) ||
            this.dict_primaryPending(tree) || this.func_primaryPending(tree) ||
            this.new_obj_primaryPending(tree);
    };
    Evaluator.prototype.eval_num_primary = function (tree, env) {
    };
    Evaluator.prototype.num_primaryPending = function (tree) {
        return tree.type == NUMBER || tree.type == NEGATIVE;
    };
    Evaluator.prototype.eval_var_primary = function (tree, env) {
        var env_and_var_name = this.getEnvironmentAndVarNameFromVarTree(tree, env);
        env = env_and_var_name[0];
        var var_name = env_and_var_name[1];
        return env[var_name];
    };
    Evaluator.prototype.var_primaryPending = function (tree) {
        var type = tree.type;
        return type == MY || type == VARIABLE;
    };
    Evaluator.prototype.eval_var_func_call = function (tree, env) {
        this.match(tree, CALL);
        var var_primary = tree.left;
        var arguments = tree.right;
        var closure = this.getEnvValue(var_primary, env);
        var params = closure.params;
        var body = closure.body;
        var closure_env = closure.env;
        var evaluated_args = this.eval_args(arguments);
        closure_env = this.extend_env(closure_env, params, evaluated_args);
    };
    Evaluator.prototype.var_func_callPending = function (tree) {
        return tree.type == CALL;
    };
    Evaluator.prototype.eval_func_primary = function (tree, env) {
        var is_static = false;
        if (tree.type == STATIC_FUNC_DEF)
            is_static = true;
        else
            this.match(tree, FUNC_DEF);
        var signature = tree.left;
        var func_name = signature.left;
        var params = signature.right;
        var body = tree.right;
        var closure = new Closure(env, params, body);
        if (func_name !== undefined)
            this.setEnvValue(func_name, closure, env);
        return closure;
    };
    Evaluator.prototype.func_primaryPending = function (tree) {
        return tree.type == STATIC_FUNC_DEF || tree.type == FUNC_DEF;
    };
    Evaluator.prototype.eval_expression = function (tree, env) {
        if (this.op_one_paramPending(tree)) {
            return this.eval_op_one_param(tree, env);
        }
        else if (this.op_two_paramsPending(tree)) {
            return this.eval_op_two_params(tree, env);
        }
        else {
            return this.eval_primary(tree, env);
        }
    };
    Evaluator.prototype.eval_assignment_statement = function (tree, env) {
        this.eval_assignment(tree.left, env);
    };
    Evaluator.prototype.assignment_statementPending = function (tree) {
        if (tree.left !== undefined)
            return this.assignmentPending(tree.left);
        return false;
    };
    Evaluator.prototype.eval_assignment = function (tree, env) {
        var var_tree = tree.left;
        var expression_tree = tree.right;
        var val = this.getEnvValue(var_tree, env);
        var exp_val = this.eval_expression(expression_tree, env);
        switch (tree.type) {
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
    };
    Evaluator.prototype.assignmentPending = function (tree) {
        var type = tree.type;
        return type == IS || type == PLUS_EQUALS || type == MINUS_EQUALS ||
            type == TIMES_EQUALS || type == DIVIDED_BY_EQUALS || type == EXPONENT_EQUALS ||
            type == MOD_EQUALS;
    };
    Evaluator.prototype.eval_if_statement = function (tree, env) {
        tree = tree.left;
        var if_test = tree.left;
        var bool = this.eval_expression(if_test.left, env);
        if (bool) {
            return this.eval_block(if_test.right, env);
        }
        else {
            return this.eval_opt_else(tree.right, env);
        }
    };
    Evaluator.prototype.if_statementPending = function (tree) {
        if (tree.left !== undefined)
            return tree.left.type === IF;
        return false;
    };
    Evaluator.prototype.eval_opt_else = function (tree, env) {
        if (tree === undefined)
            return;
        this.match(tree, ELSE);
        var if_or_block = tree.right;
        if (this.if_statementPending(if_or_block)) {
            return this.eval_if_statement(if_or_block, env);
        }
        if (this.blockPending(if_or_block)) {
            return this.eval_block(if_or_block, env);
        }
    };
    Evaluator.prototype.eval_block = function (tree, env) {
        this.match(tree, DO);
        var statement_list = tree.left;
        return this.eval_statement_list(statement_list, env);
    };
    Evaluator.prototype.blockPending = function (tree) {
        return tree.type === DO;
    };
    Evaluator.prototype.eval_while_statement = function (tree, env) {
        var while_ = tree.left;
        var exp_tree = while_.left;
        var block_tree = while_.right;
        while (this.eval_expression(exp_tree, env)) {
            this.eval_block(block_tree, env);
        }
    };
    Evaluator.prototype.while_statementPending = function (tree) {
        if (tree.left !== undefined)
            return tree.left.type === WHILE;
        return false;
    };
    Evaluator.prototype.eval_print_statement = function (tree, env) {
        var print_ = tree.left;
        var exp_tree = print_.right;
        print(this.eval_expression(exp_tree, env));
    };
    Evaluator.prototype.print_statementPending = function (tree) {
        if (tree.left !== undefined)
            return tree.left.type === PRINT;
        return false;
    };
    Evaluator.prototype.eval_import_statement = function (tree, env) {
        var import_ = tree.left;
        var variable_tree = import_.left;
        var opt_as_tree = import_.right;
        var var_name = variable_tree.value;
        var as_name;
        if (opt_as_tree !== undefined)
            as_name = opt_as_tree.left;
    };
    Evaluator.prototype.import_statementPending = function (tree) {
        if (tree.left !== undefined)
            return tree.left.type === IMPORT;
        return false;
    };
    Evaluator.prototype.eval_statement = function (tree, env) {
        this.match(tree, STATEMENT_END);
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
    };
    Evaluator.prototype.statementPending = function (tree) {
        return this.if_statementPending(tree) || this.while_statementPending(tree) ||
            this.print_statementPending(tree) || this.assignment_statementPending(tree) ||
            this.primary_statementPending(tree) || this.class_def_statementPending(tree) ||
            this.import_statementPending(tree);
    };
    Evaluator.prototype.eval_statement_list = function (tree, env) {
        if (this.statementPending(tree)) {
            this.eval_statement(tree, env);
            this.eval_statement_list(tree.right, env);
        }
    };
    return Evaluator;
}());
