# programming-language intro
following along with http://beastie.cs.ua.edu/cs403/schedule.html

--------------------------------------------------------------------------------
(WHEN MAKING ANY CHANGES TO THE LANGUAGE:
    must update
                Types.ts (maybe)
                Lexer.ts (probably)
                grammar_rules.ts
                Parser.ts
                PrettyPrinter.ts
                Evaluator.ts
)

some things of note:
    0. most grammar design decisions were chosen due to me messing around on the android keyboard and seeing what would feel nicest to write as a text language (nicest in terms of me thinking it was cute and in terms of minimizing keyboard mode switching for common cases)

    1. operators and other things can be represented both symbolically and verbally (e.g. 'x is 3' is equivalent to 'x = 3', 'y + 3' is equivalent to 'y plus 3')

    2. periods AND newlines are used as statement separators. however, periods are not counted as a statement separator if they are immediately followed by a digit (in these cases, they act as a decimal point in the number)

        of note is that in cases where digits are followed by a period, but no digits immediately follow the period, (e.g. "123."), the period will act as a statement separator, and NOT as a decimal of the number.

    3. conditional and loop blocks start with 'do' and end with 'end' in addition to being able to start and end with '{' and '}', respectively. like the brace equivalent, these need no statement separators, but unlike the brace equivalent, they need some whitespace before and after them (or else they will be viewed as part of a variable)

    4. variables local to a class object are always prepended by "my"
    (e.g. "
        class dog do
            my name is "willow"
            def bark do
                print my name
            end
        end
    ")
    when used outside of a class/method definition, refers to the global environment

    5. there is a flat global scope kind of like python/javascript
        -each function has its own scope, which all variable get/set in the func def refers to, UNLESS
            -the "global var_name" statement occurs before the access, in which case all subsequent
                var_name gets/sets refer to the global scope
            -the get/set is prepended by the "my" keyword, in which case it refers to the appropriate
                class scope

--------------------------------------------------------------------------------
# to do
    -[x] lexing for && and || and ! (and "and" and "or" i think)
    -[x] add grammar rules for classes/objects!!!
    -[x] GRAMMAR rules for default parameter values??
    -[x] can classes be anonymous?
    -[x] import and from import???
    -[x] implement parse functions and parse trees??
    -[x] class accessor restructure
        -[x] "call dog's bark" instead of "call dog bark"
            -[ ] possibly prevent variable names from ending in "s"??? and autocorrect to possesive
        -[x] restructure function calls/variable primary to allow infinite object member access
            (e.g. instead of variable_primary = "opt_var && var" ->
                             variable_primary = "opt_obj && var" ->
                             opt_obj = (var && APOSTROPHE_S && opt_obj) || _empty_)
    -[x] allow "WHEN CREATED"
    -[x] static definitions??? (what do they mean in global scope)
    -[x] allow single line blocks without do/end ("if z equals 3 x is 3.")
    -[ ] allow chaining assignments or mult var assignments? ("x is y is 3" AND/OR "x, y is 3, 4")
    -[ ] pretty printer
    -[ ] evaluating parse trees
        -[ ] how do you know scope? nested environments?
    -[ ] evaluating import statements using filename as module names??? (see eval_import_statement)

    -[ ] allow developers to create their own interfaces between textscript and javascript?
        -[ ] or call native javascript functions???
