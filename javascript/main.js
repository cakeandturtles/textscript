function main() {
    var program_run = document.getElementById("program_run");
    program_run.onclick = runProgram;
}
var parser, evaluator;
function runProgram() {
    var program_txt_element = document.getElementById("program_txt");
    var program_txt = program_txt_element.value;
    parser = new Parser();
    var root = parser.parse(program_txt);
    PrettyPrinter.prettyPrint(root);
    evaluator = new Evaluator();
    evaluator.eval(root);
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
