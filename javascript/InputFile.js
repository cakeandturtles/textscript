var InputFile = (function () {
    function InputFile(program_txt) {
        this.program_txt = program_txt;
        this.char_index = 0;
        this.failed = false;
    }
    InputFile.prototype.backup = function () {
        this.char_index = this.char_index - 1;
    };
    InputFile.prototype.read = function () {
        return "";
    };
    return InputFile;
}());
