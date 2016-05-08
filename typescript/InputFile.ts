class InputFile{
    private program_txt : string;
    protected char_index : Number;
    public failed : boolean;
    constructor(program_txt : string){
        this.program_txt = program_txt;
        this.char_index = 0;
        this.failed = false;
    }

    public backup() : void {
        this.char_index = this.char_index - 1;
    }

    public read() : string {
        return "";
    }
}
