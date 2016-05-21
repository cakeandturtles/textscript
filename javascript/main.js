function main() {
    main.prototype.grammar_text = undefined;
    var program_run = document.getElementById("program_run");
    var message_text = document.getElementById("message_text");
    function loadedGrammarText(error, text) {
        if (error)
            alert("Could not load grammar, error: " + error);
        else {
            main.prototype.grammar_text = text;
            program_run.disabled = false;
            message_text.innerHTML = "";
        }
    }
    program_run.disabled = true;
    message_text.innerHTML = "loading grammar...";
    loadExternalFile("javascript/Grammar.js", loadedGrammarText);
    program_run.onclick = runProgram;
}
var parser;
function runProgram() {
    var program_txt_element = document.getElementById("program_txt");
    var program_txt = program_txt_element.value;
    var grammar_text = main.prototype.grammar_text;
    parser = new Parser(grammar_text);
    parser.grammatical_functions.statement = (function statement(self) {
        if (self.grammatical_functions.expressionPending(self)) {
            print("EXPRESSION STATEMENT");
            self.grammatical_functions.expression(self);
            self.grammatical_functions.statement_end(self);
        }
        else if (self.grammatical_functions.if_statementPending(self)) {
            print("IF STATEMENT");
            self.grammatical_functions.if_statement(self);
        }
        else if (self.grammatical_functions.while_statementPending(self)) {
            print("WHILE STATEMENT");
            self.grammatical_functions.while_statement(self);
        }
        print("statement");
    });
    parser.parse(program_txt);
}
function print(value) {
    console.log(value);
}
function loadExternalFile(file_path, callback) {
    var file = new XMLHttpRequest();
    file.open("GET", file_path, true);
    file.onreadystatechange = function () {
        if (file.readyState === 4) {
            if (file.status === 200 || file.status == 0) {
                var text = file.responseText;
                callback(false, text);
            }
            else {
                callback("Could not load file: " + file_path);
            }
        }
    };
    file.send(null);
}
