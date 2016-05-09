var InputFile = (function () {
    function InputFile(program_txt) {
        this.program_txt = program_txt;
        this.char_index = 0;
        this.failed = false;
    }
    InputFile.prototype.backup = function () {
        this.char_index--;
    };
    InputFile.prototype.read = function () {
        if (this.char_index < this.program_txt.length) {
            var char = this.program_txt[this.char_index];
            this.char_index++;
            return char;
        }
        else {
            this.failed = true;
            return null;
        }
    };
    return InputFile;
}());
