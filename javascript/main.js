function main() {
    var program_run = document.getElementById("program_run");
    var program_txt = document.getElementById("program_txt");
    program_run.onclick = function () {
        scanner(program_txt.value);
    };
}
function print(value) {
    console.log(value);
}
