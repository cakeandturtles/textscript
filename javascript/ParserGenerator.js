var ParserGenerator = (function () {
    function ParserGenerator() {
    }
    ParserGenerator.GenerateGrammaticalFunctions = function (grammar_text) {
        var grammatical_functions = {};
        var grammar_text_rules = grammar_text.trim().split(";");
        for (var i = 0; i < grammar_text_rules.length; i++) {
            if (grammar_text_rules[i].length === 0)
                continue;
            var grammar_text_rule = grammar_text_rules[i].trim().split("=");
            var lhs = grammar_text_rule[0].trim();
            lhs = lhs.split("var")[1].trim();
            var rhs = grammar_text_rule[1].trim();
            var function_string = "function " + lhs + "(self){";
            function_string += this.GenerateOptionals(rhs);
            function_string += "\n\tprint(\"" + lhs + "\");";
            function_string += "\n}";
            var function_pending_string = "function " + lhs + "Pending(self){";
            function_pending_string += this.GeneratePendingOptionals(rhs);
            function_pending_string += "\n}";
            grammatical_functions[lhs] = eval("(" + function_string + ")");
            grammatical_functions[lhs + "Pending"] = eval("(" + function_pending_string + ")");
        }
        return grammatical_functions;
    };
    ParserGenerator.GenerateOptionals = function (rsh) {
        var function_body_string = "";
        var optionals = rsh.split("||");
        for (var i = 0; i < optionals.length; i++) {
            var compounds = optionals[i].trim().split("&&");
            function_body_string += "\n\t";
            var first = compounds[0].trim();
            if (first.charAt(0) === "(") {
                first = first.substr(1);
            }
            if (first === "_empty_") { }
            else if (first.toUpperCase() === first) {
                if (i !== 0)
                    function_body_string += "else ";
                function_body_string += "if (self.check(" + first + ")){";
                function_body_string += this.GenerateCompounds(compounds);
                function_body_string += "\n\t}";
            }
            else if (first.toLowerCase() === first) {
                if (i !== 0)
                    function_body_string += "else ";
                function_body_string += "if (self.grammatical_functions." + first + "Pending(self)){";
                function_body_string += this.GenerateCompounds(compounds);
                function_body_string += "\n\t}";
            }
        }
        return function_body_string;
    };
    ParserGenerator.GeneratePendingOptionals = function (rsh) {
        var pending_body_string = "\n\treturn ";
        var optionals = rsh.split("||");
        for (var i = 0; i < optionals.length; i++) {
            if (i !== 0)
                pending_body_string += " ||\n\t\t\t";
            var compounds = optionals[i].trim().split("&&");
            var first = compounds[0].trim();
            if (first.charAt(0) === "(") {
                first = first.substr(1);
            }
            if (first === "_empty_") {
                pending_body_string += "true";
            }
            else if (first.toUpperCase() === first) {
                pending_body_string += ("self.check(" + first + ")");
            }
            else {
                pending_body_string += ("self.grammatical_functions." + first + "Pending(self)");
            }
        }
        pending_body_string += ";";
        return pending_body_string;
    };
    ParserGenerator.GenerateCompounds = function (compounds) {
        var conditional_body_string = "";
        for (var i = 0; i < compounds.length; i++) {
            var compound = compounds[i].trim();
            if (compound.charAt(0) === "(")
                compound = compound.substr(1);
            if (compound.charAt(compound.length - 1) === ")")
                compound = compound.substring(0, compound.length - 1);
            if (compound.toUpperCase() === compound) {
                conditional_body_string += "\n\t\tself.match(" + compound + ");";
            }
            else if (compound.toLowerCase() === compound) {
                conditional_body_string += "\n\t\tself.grammatical_functions." + compound + "(self);";
            }
        }
        return conditional_body_string;
    };
    return ParserGenerator;
}());
