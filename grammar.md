operator : PLUS | TIMES | MINUS | DIVIDED_BY

primary : NUMBER
        | VARIABLE
        | VARIABLE OPAREN optExpressionList CPAREN
        | OPAREN expression CPAREN

list : primary
     | primary COMMA list

optExpressionList : list
                  | *empty*

ifStatement : IF boolean block optElse

boolean : primary IS? primary
        | primary comparator primary
        | TRUE
        | FALSE

comparator : GT | GTE | LT | LTE | EQ | NEQ

optElse : ELSE block
        | *empty*

whileStatement : WHILE boolean block

block : DO statementList END

statementList : statement
              | statement stamentList

statement : expression statement_end
          | ifStatement
          | assignment statement_end
          | whileStatement

expression : primary operator expression
           | primary

statement_end : NEWLINE
              | SEMICOLON

assignment : VARIABLE IS expression
