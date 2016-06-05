var opt_newline = (NEWLINE && opt_newline) || _empty_;

//levels of precedence (high -> low)
var op = NOT || BITWISE_NOT || exponent || TIMES || divided_by ||
         MOD || PLUS || MINUS || BITWISE_AND || BITWISE_XOR ||
         BITWISE_OR || AND || OR;

var exponent = EXPONENT || (TO && THE);
var divided_by = DIVIDED_BY || (DIVIDED && opt_by);
//"12 divided 3" is valid in google search
var opt_by = BY || _empty_;

/********************* PRIMARIES ******************************************/
var primary = num_primary || BOOLEAN || STRING || var_primary ||
              list_primary || dict_primary || func_primary || new_obj_primary ||
              expression;

var num_primary = NUMBER || (MINUS && NUMBER);

var var_primary = (VARIABLE && opt_var) || var_func_call;

var opt_var = VARIABLE || _empty_;

var var_func_call = CALL && VARIABLE && opt_var && opt_with_call;

var opt_with_call = WITH && primary && opt_list_continuation;

var list_primary = OBRACKET && opt_list_body && CBRACKET;

var list_body = primary && opt_list_continuation;

var opt_list_body = list_body || _empty_;

var opt_list_continuation = (opt_newline && COMMA && opt_newline && list_body) ||
                            _empty_;

var dict_primary = OBRACE && opt_dict_body && CBRACE;

var dict_body = normal_assignment && opt_dict_continuation;

var opt_dict_body = dict_body || _empty_;

var opt_dict_continuation = (opt_newline && COMMA && opt_newline && dict_body) ||
                            _empty_;

var func_primary = DEF && opt_var && opt_with_def && block;

var opt_with_def = (WITH && VARIABLE && (opt_with_def_continuation || (IS && expression &&
                   opt_with_default_continuation))) || _empty_;

var opt_with_def_continuation = (opt_newline && COMMA && opt_newline && VARIABLE &&
            opt_with_def_continuation) || (COMMA && opt_newline && normal_assignment &&
            opt_with_default_continuation) || _empty_;

var opt_with_default_continuation = (opt_newline && COMMA && opt_newline &&
             normal_assignment && opt_with_default_continuation) || _empty_;

var new_obj_primary = NEW && VARIABLE && opt_with_call;

/**************************************************************************/

var todo = LOG && primary || primary && comparator && primary;
var expression = (primary && opt_expression_op_rhs) ||
                 (OPAREN && expression && CPAREN);

var opt_expression = expression || _empty_;

var opt_expression_op_rhs = (op && expression) ||  _empty_;

/**************************************************************************/

var assignment_statement = assignment && statement_end;

//opt_var allows for setting object members
var assignment = VARIABLE && opt_var && assignment_op && expression;

var normal_assignment = VARIABLE && IS && expression;

var assignment_op = IS || PLUS_EQUALS || MINUS_EQUALS || TIMES_EQUALS ||
                    DIVIDED_BY_EQUALS || EXPONENT_EQUALS || MOD_EQUALS;

/**************************************************************************/

var if_statement = (IF && boolean && block && opt_else);

var opt_else = (ELSE && (if_statement || block)) || _empty_;

//TODO:: parenthetical nesting?
var boolean = (primary && comparator && primary) || (NOT && boolean) || BOOLEAN;

var comparator = GREATER_THAN || GREATER_THAN_EQUAL || LESS_THAN ||
                 LESS_THAN_EQUAL || EQUAL_TO || NOT_EQUAL_TO;

var while_statement = (WHILE && boolean && block);

var block = opt_newline && DO && opt_newline && statement_list && opt_newline &&
            END && opt_newline;

var print_statement = PRINT && primary && statement_end;

var func_def_statement = func_primary && statement_end;

/**************************************************************************/

var class_def_statement = class_primary && statement_end;

var class_primary = CLASS && opt_var && opt_extends && START && class_body && END;

var opt_extends = (EXTENDS && VARIABLE) || _empty_;

var class_body = (NEWLINE && class_body) || (member_def && class_body) ||
                 (method_def && class_body) || (init_def && class_body) || _empty_;

var init_def = WHEN && CREATED && opt_with_def && block;

var member_def = MY && normal_assignment;

var method_def = opt_static && func_primary;

var opt_static = STATIC || _empty_;

/**************************************************************************/

var import_statement = (IMPORT && VARIABLE && opt_as);

var opt_as = (AS && VARIABLE);

var statement =  if_statement || while_statement || print_statement ||
                 assignment_statement || func_def_statement || class_def_statement ||
                 import_statement || (opt_expression && statement_end);

var statement_end = PERIOD || NEWLINE || END_OF_INPUT;

var statement_list = statement || statement_list || _empty_;
