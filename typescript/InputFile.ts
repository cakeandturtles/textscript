class InputFile{
    private program_txt : string;
    protected char_index : number;
    public failed : boolean;
    constructor(program_txt : string){
        this.program_txt = program_txt;
        this.char_index = 0;
        this.failed = false;
    }

    public backup() : void {
        this.char_index--;
    }

    public read() : string {
        if (this.char_index < this.program_txt.length){
            var char : string = this.program_txt[this.char_index];
            this.char_index++;
            return char;
        }else{
            this.failed = true;
            return null;
        }
    }
}
