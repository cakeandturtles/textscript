class Evaluator{
    public eval(tree: Lexeme, env: Environment): any{
        var f = this.getEvalFunction(tree.type);
        if (f === undefined)
            throw("no evaluation function for type " + tree.type);
        else
            return f(tree, env);
    }

    public getEvalFunction(type: string): (tree: Lexeme, env: Environment) => any
    {
        switch(type){
            case "START":
                break;
            case "STATEMENT_END":
                break;
            case "PRINT":
                return this.print_statement;
        }
    }

    /***************************OPERATORS**************************************/
    private op_one_param(tree: Lexeme, env: Environment){
    }

    private print_statement(tree: Lexeme, env: Environment){
        var primary = this.eval(tree.right, env);
        print(primary);
    }


}
