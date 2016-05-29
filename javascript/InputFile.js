var InputFile = (function () {
    function InputFile(program_txt) {
        this.program_txt = program_txt;
        this.program_lines = program_txt.split("\n");
        for (var i = 0; i < this.program_lines.length - 1; i++) {
            this.program_lines[i] += "\n";
        }
        this.char_index = 0;
        this.failed = false;
        this.line_num = 0;
        this.index_on_line = 0;
    }
    InputFile.prototype.updateLineNums = function () {
        var i = 0;
        this.line_num = 0;
        var line_length = this.program_lines[this.line_num].length;
        while (i < this.char_index) {
            if (this.line_num >= this.program_lines.length)
                break;
            line_length = this.program_lines[this.line_num].length;
            if (i + line_length <= this.char_index) {
                i += line_length;
                this.line_num++;
            }
            else {
                i = this.char_index;
                this.index_on_line = (i + line_length) - this.char_index;
            }
        }
        if (this.line_num >= this.program_lines.length) {
            this.line_num--;
            this.index_on_line = line_length;
        }
        if (this.index_on_line > this.char_index)
            this.index_on_line = this.char_index;
    };
    InputFile.prototype.backup = function (reset_failed) {
        if (reset_failed === void 0) { reset_failed = false; }
        this.char_index--;
        this.updateLineNums();
        if (reset_failed)
            this.failed = false;
    };
    InputFile.prototype.getLineNum = function () { return this.line_num; };
    InputFile.prototype.getIndexOnLine = function () { return this.index_on_line; };
    InputFile.prototype.getLine = function () {
        var line = this.program_lines[this.line_num];
        var line_length = line.length;
        return line.substr(0, line_length);
    };
    InputFile.prototype.getChar = function () {
        if (this.char_index < this.program_txt.length)
            return this.program_txt[this.char_index];
        return undefined;
    };
    InputFile.prototype.read = function () {
        var char = this.getChar();
        if (char === "\n")
            this.line_num++;
        if (char === undefined)
            this.failed = true;
        this.char_index++;
        this.updateLineNums();
        return char;
    };
    InputFile.prototype.getCharIndex = function () {
        return this.char_index;
    };
    return InputFile;
}());
