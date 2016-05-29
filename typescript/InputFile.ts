class InputFile{
    private program_txt: string;
    private program_lines: string[];
    protected char_index: number;
    protected line_num: number;
    protected index_on_line: number;
    public failed: boolean;
    constructor(program_txt : string){
        this.program_txt = program_txt;
        this.program_lines = program_txt.split("\n");
        for (let i = 0; i < this.program_lines.length-1; i++){
            //add the newlines back into the array
            //(split gets rid of them)
            this.program_lines[i] += "\n";
        }
        this.char_index = 0;
        this.failed = false;

        this.line_num = 0;
        this.index_on_line = 0;
    }

    private updateLineNums(): void{
        var i = 0;
        this.line_num = 0;

        var line_length: number = this.program_lines[this.line_num].length;
        while (i < this.char_index){
            if (this.line_num >= this.program_lines.length)
                break;

            line_length = this.program_lines[this.line_num].length;

            if (i + line_length <= this.char_index){
                i += line_length;
                this.line_num++;
            }else{
                i = this.char_index;
                this.index_on_line = (i + line_length) - this.char_index;
            }
        }

        if (this.line_num >= this.program_lines.length){
            //END OF INPUT
            this.line_num--;
            this.index_on_line = line_length;
        }
        if (this.index_on_line > this.char_index)
            this.index_on_line = this.char_index;
    }

    public backup(reset_failed: boolean = false) : void {
        this.char_index--;
        this.updateLineNums();

        if (reset_failed)
            this.failed = false;
    }

    public getLineNum(): number{ return this.line_num; }
    public getIndexOnLine(): number{ return this.index_on_line; }
    public getLine(): string {
        var line: string = this.program_lines[this.line_num];
        var line_length: number = line.length;
        //remove the trailing "\n"
        return line.substr(0, line_length);
    }

    public getChar(): string{
        if (this.char_index < this.program_txt.length)
            return this.program_txt[this.char_index];
        return undefined;
    }

    public read() : string {
        var char: string = this.getChar();
        if (char === "\n") this.line_num++;
        //EOF
        if (char === undefined) this.failed = true;

        this.char_index++;
        this.updateLineNums();
        return char;
    }

    public getCharIndex() : number{
        return this.char_index;
    }
}
