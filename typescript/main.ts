function main() : void{
    main.prototype.grammar_text = undefined;
    var program_run = <HTMLInputElement>document.getElementById("program_run");
    var message_text = document.getElementById("message_text");

    function loadedGrammarText(error, text){
        if (error)
            alert("Could not load grammar, error: " + error);
        else{
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
function runProgram(){
    var program_txt_element = <HTMLInputElement>document.getElementById("program_txt");
    var program_txt = program_txt_element.value;

    var grammar_text = main.prototype.grammar_text;
    parser = new Parser(grammar_text);

    parser.parse(program_txt);
}

function print(value:any): void{
    console.log(value);
}

//http://stackoverflow.com/questions/14446447/javascript-read-local-text-file
function loadExternalFile(file_path, callback){
	var file = new XMLHttpRequest();
	file.open("GET", file_path, true);
	file.onreadystatechange = function(){
		if (file.readyState === 4){
			if (file.status === 200 || file.status == 0){
				var text = file.responseText;
				callback(false, text);
			}else{
				callback("Could not load file: " + file_path);
			}
		}
	}
	file.send(null);
}
