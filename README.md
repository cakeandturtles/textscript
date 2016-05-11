# programming-language intro
following along with http://beastie.cs.ua.edu/cs403/schedule.html

--------------------------------------------------------------------------------
i'm not always terribly good at updating the formal grammar, but i probably will get around to it when the full language is mocked up

some things of note:
    0. most design decisions were chosen due to me messing around on the android keyboard and seeing what would feel nicest to write as a text language (nicest in terms of me thinking it was cute and in terms of minimizing keyboard mode switching for common cases)

    1. operators and other things can be represented both symbolically and verbally (e.g. 'x is 3' is equivalent to 'x = 3', 'y + 3' is equivalent to 'y plus 3')

    2. periods AND newlines are used as statement separators. however, periods are not counted as a statement separator if they are immediately followed by a digit (in these cases, they act as a decimal point in the number)

        of note is that in cases where digits are followed by a period, but no digits immediately follow the period, (e.g. "123."), the period will act as a statement separator, and NOT as a decimal of the number.

    3. conditional and loop blocks start with 'do' and end with 'end' in addition to being able to start and end with '{' and '}', respectively. like the brace equivalent, these need no statement separators, but unlike the brace equivalent, they need some whitespace before and after them (or else they will be viewed as a variable)

--------------------------------------------------------------------------------
# to do

    1. lexer currently doesn't lex 'compound keywords' like "greater than" or "divided by" as single keywords. decide whether to do that and if so, implement it
    2. start working on parser?
