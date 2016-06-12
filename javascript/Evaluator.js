var Evaluator = (function () {
    function Evaluator() {
    }
    Evaluator.prototype.eval = function (tree, env) {
        var f = this.getEvalFunction(tree.type);
        if (f === undefined)
            throw ("no evaluation function for type " + tree.type);
        else
            return f(tree, env);
    };
    Evaluator.prototype.getEvalFunction = function (type) {
        switch (type) {
            case "START":
                break;
            case "STATEMENT_END":
                break;
            case "PRINT":
                return this.print_statement;
        }
    };
    Evaluator.prototype.op_one_param = function (tree, env) {
    };
    Evaluator.prototype.print_statement = function (tree, env) {
        var primary = this.eval(tree.right, env);
        print(primary);
    };
    return Evaluator;
}());
