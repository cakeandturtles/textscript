function main() : void{
    var program_run = <HTMLInputElement>document.getElementById("program_run");
    program_run.onclick = runProgram;
}

var parser;
function runProgram(){
    var program_txt_element = <HTMLInputElement>document.getElementById("program_txt");
    var program_txt = program_txt_element.value;

    parser = new Parser();
    parser.parse(program_txt);
    parser.prettyPrint();
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
