class PrettyPrinter{
    public static prettyPrint(tree: Lexeme): void{
        if (tree === undefined) return;
        switch(tree.type){
            case START:
                this.prettyPrint(tree.right);
                break;
            case STATEMENT_END:
                this.prettyPrint(tree.left);
                this.prettyPrint(tree.right);
                break;
            case VARIABLE:
                print(tree.value);
                break;
            case NUMBER:
                print(tree.value);
                break;
            case IS:
                this.prettyPrint(tree.left);
                print("is");
                this.prettyPrint(tree.right);
                break;
            default: print("???");
        }
    }
}
