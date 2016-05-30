var opt_newline = (NEWLINE && opt_newline) || _empty_;
var op0 = exponent;
var op1 = TIMES || divided_by || MOD;
var op2 = PLUS || MINUS;
var op3 = AND || OR;
var exponent = EXPONENT || (TO && THE);
var divided_by = DIVIDED_BY || (DIVIDED && BY);
var primary = num_primary || bool_primary || str_primary || var_primary ||
    list_primary || dict_primary || func_primary || expression;
var num_primary = NUMBER || (MINUS && NUMBER) || (LOG && NUMBER);
var bool_primary = BOOLEAN || (NOT && bool_primary) ||
    (primary && comparator && primary);
var str_primary = STRING;
var var_primary = VARIABLE || var_func_call;
var list_primary = OBRACKET && opt_list_body && CBRACKET;
var dict_primary = OBRACE && opt_dict_body && CBRACE;
var func_primary = DEF && opt_func_name && opt_newline && opt_with_def &&
    opt_newline && block;
var expression = (primary && opt_expression_op_rhs) ||
    (OPAREN && expression && CPAREN);
var opt_expression = expression || _empty_;
var opt_expression_op_rhs = (op0 && expression) || (op1 && expression) ||
    (op2 && expression) || (op3 && expression) || _empty_;
var opt_func_name = VARIABLE || _empty_;
var var_func_call = CALL && VARIABLE && opt_with_call;
var opt_with_def = WITH && VARIABLE && opt_with_def_continuation;
var opt_with_def_continuation = COMMA && VARIABLE && opt_with_def_continuation ||
    _empty_;
var opt_with_call = WITH && primary && opt_with_call_continutation;
var opt_with_call_continutation = COMMA && primary && opt_with_call_continutation ||
    _empty_;
var list_body = primary && opt_list_continuation;
var opt_list_body = list_body || _empty_;
var opt_list_continuation = (opt_newline && COMMA && opt_newline && list_body) ||
    _empty_;
var dict_body = normal_assignment && opt_dict_continuation;
var opt_dict_body = dict_body || _empty_;
var opt_dict_continuation = (opt_newline && COMMA && opt_newline && dict_body) ||
    _empty_;
var assignment_statement = assignment && statement_end;
var assignment = VARIABLE && (normal_assignment_rhs || plus_assignment_rhs ||
    minus_assignment_rhs || times_assignment_rhs ||
    divided_by_assignment_rhs || exponent_assignment_rhs ||
    mod_assignment_rhs);
var normal_assignment = VARIABLE && normal_assignment_rhs;
var normal_assignment_rhs = IS && expression;
var plus_assignment_rhs = PLUS_EQUALS && expression;
var minus_assignment_rhs = MINUS_EQUALS && expression;
var times_assignment_rhs = TIMES_EQUALS && expression;
var divided_by_assignment_rhs = DIVIDED_BY_EQUALS && expression;
var exponent_assignment_rhs = EXPONENT_EQUALS && expression;
var mod_assignment_rhs = MOD_EQUALS && expression;
var if_statement = (IF && boolean && block && opt_newline && opt_else);
var opt_else = (ELSE && (if_statement || block)) || _empty_;
var boolean = (primary && comparator && primary) || (NOT && boolean) || BOOLEAN;
var comparator = GREATER_THAN || GREATER_THAN_EQUAL || LESS_THAN ||
    LESS_THAN_EQUAL || EQUAL_TO || NOT_EQUAL_TO;
var while_statement = (WHILE && boolean && block);
var block = (DO && opt_newline && statement_list && opt_newline && END);
var print_statement = PRINT && primary && statement_end;
var statement = if_statement || while_statement || print_statement ||
    assignment_statement || (opt_expression && statement_end);
var statement_end = PERIOD || NEWLINE || END_OF_INPUT;
var statement_list = statement || statement_list || _empty_;
