function main() : void{
    var program_run = <HTMLInputElement>document.getElementById("program_run");
    var program_txt = <HTMLInputElement>document.getElementById("program_txt");
    program_run.onclick = function(){
        scanner(program_txt.value);
    }
}

function print(value:any) : void{
    console.log(value);
}
