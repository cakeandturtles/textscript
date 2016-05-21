class ParserGenerator{
    /**TODO:: NOTE::
    currently, this parser generator will only work when the Grammar.ts
    follows a set of specific format guidelines:
        1. every rule must be "var lhs = rhs;";
            a. must start with the "var" declaration
            b. must be separated by a "=" assignment
            c. must end with a ";" semicolon
        2. lhs is a lowercase non-terminal rule
        3. rhs, on its top level, is a series of optional rules separated by "||" or signs
            a. each optional option can either be a single TERMINAL/non-terminal
            b. or it can be a sequence of TERMINALS/non-terminals demarcated by an "(" and ")", and separated by "&&";
                (e.g.   "(VARIABLE && NUMBER && expression)"   )
            c. any sequence combined by "&&" cannot have any optionals separated by "||"s
            d. to get around limitations caused by this, simply created more non-terminal rules!!
                (e.g. instead of "var lhs = NUMBER || VARIABLE || (VARIABLE && NUMBER);"
                                you would write
                      "var lhs = NUMBER || (VARIABLE && opt_number);
                       var opt_number = NUMBER || _empty_;")

                (e.g. instead of "var lhs = VARIABLE || (VARIABLE && NUMBER) || (VARIABLE && OPAREN && CPAREN);"
                                you would write
                      "var lhs = (VARIABLE && opt_number_or_parens);
                       var opt_number_or_parens = NUMBER || (OPAREN && CPAREN) || _empty_;")
    *****/
    constructor(){}

    public static GenerateGrammaticalFunctions(grammar_text: string): {[id: string]: Function }
    {
        var grammatical_functions: {[id: string]: Function} = {};

        var grammar_text_rules : string[] = grammar_text.trim().split(";");

        //generate methods for each grammar rule!
        for (var i : number = 0; i < grammar_text_rules.length; i++){
            if (grammar_text_rules[i].length === 0) continue;

            //assuming grammar is well defined
            var grammar_text_rule : string[] = grammar_text_rules[i].trim().split("=");
            var lhs : string = grammar_text_rule[0].trim();
            //get the actual lsh word (ignore the "var")
            lhs = lhs.split("var")[1].trim();

            var rhs : string = grammar_text_rule[1].trim();

            var function_string: string = "function " + lhs + "(self){";
            function_string += this.GenerateOptionals(rhs);
            function_string += "\n\tprint(\""+lhs+"\");";
            function_string += "\n}";

            var function_pending_string: string = "function " + lhs + "Pending(self){";
            function_pending_string += this.GeneratePendingOptionals(rhs);
            function_pending_string += "\n}";

            grammatical_functions[lhs] = eval("(" + function_string + ")");
            grammatical_functions[lhs+"Pending"] = eval("(" + function_pending_string + ")");
        }
        return grammatical_functions;
    }

    private static GenerateOptionals(rsh: string): string {
        var function_body_string: string = "";
        var optionals : string[] = rsh.split("||");

        for (var i : number = 0; i < optionals.length; i++){
            var compounds : string[] = optionals[i].trim().split("&&");
            function_body_string += "\n\t";


            var first = compounds[0].trim();
            //get rid of any open parens
            if (first.charAt(0) === "("){
                first = first.substr(1);
            }

            //_empty_ //TODO:: do i need to even do anything for this???
            if (first === "_empty_"){}
            //if uppercase, it's terminal
            else if (first.toUpperCase() === first){
                if (i !== 0) function_body_string += "else ";
                function_body_string += "if (self.check(" + first + ")){";
                function_body_string += this.GenerateCompounds(compounds);
                function_body_string += "\n\t}";
            }
            //if lowercase, it's not terminal
            else if (first.toLowerCase() === first){
                if (i !== 0) function_body_string += "else ";
                function_body_string += "if (self.grammatical_functions." + first + "Pending(self)){";
                function_body_string += this.GenerateCompounds(compounds);
                function_body_string += "\n\t}";
            }
        }
        return function_body_string;
    }

    private static GeneratePendingOptionals(rsh: string): string {
        var pending_body_string: string = "\n\treturn ";
        var optionals: string[] = rsh.split("||");

        for (var i: number = 0; i < optionals.length; i++){
            if (i !== 0) pending_body_string += " ||\n\t\t\t";

            var compounds : string[] = optionals[i].trim().split("&&");
            var first = compounds[0].trim();
            //get rid of any open parens
            if (first.charAt(0) === "("){
                first = first.substr(1);
            }

            //_empty_ //TODO???
            if (first === "_empty_"){
                pending_body_string += "true";
            }
            //if uppercase, it's terminal
            else if (first.toUpperCase() === first){
                pending_body_string += ("self.check(" + first + ")");
            }
            //if lowercase, it's NOT terminal (need to call its pending)
            else{
                pending_body_string += ("self.grammatical_functions." + first + "Pending(self)");
            }
        }
        pending_body_string += ";";
        return pending_body_string;
    }

    private static GenerateCompounds(compounds: string[]): string {
        var conditional_body_string = "";

        for (var i : number = 0; i < compounds.length; i++){
            var compound : string = compounds[i].trim();
            //remove any open parens...
            if (compound.charAt(0) === "(")
                compound = compound.substr(1);

            //remove any close parens..
            if (compound.charAt(compound.length-1) === ")")
                compound = compound.substring(0, compound.length-1);

            //if uppercase, it's terminal
            if (compound.toUpperCase() === compound){
                conditional_body_string += "\n\t\tself.match(" + compound +");";
            }
            //if lowercase, it's not terminal
            else if (compound.toLowerCase() === compound){
                conditional_body_string += "\n\t\tself.grammatical_functions." + compound + "(self);";
            }
        }
        return conditional_body_string;
    }
}
