const _empty_ = null;

const OPAREN: string = "OPAREN";
const CPAREN: string = "CPAREN";
const OBRACE: string = "OBRACE";
const CBRACE: string = "CBRACE";
const OBRACKET: string = "OBRACKET";
const CBRACKET: string = "CBRACKET";
const COMMA: string = "COMMA";
const LESS_THAN: string = "LESS_THAN";
const LESS_THAN_EQUAL: string = "LESS_THAN_EQUAL";
const GREATER_THAN: string = "GREATER_THAN";
const GREATER_THAN_EQUAL: string = "GREATER_THAN_EQUAL";
const EQUAL_TO: string = "EQUAL_TO";
const NOT: string = "NOT";
const NOT_EQUAL_TO: string = "NOT_EQUAL_TO";
const PERIOD: string = "PERIOD";
const NEWLINE: string = "NEWLINE";

const PLUS: string = "PLUS";
const PLUS_EQUALS: string = "PLUS_EQUALS";
const PLUS_PLUS: string = "PLUS_PLUS";
const MINUS: string = "MINUS";
const MINUS_EQUALS: string = "MINUS_EQUALS";
const MINUS_MINUS: string = "MINUS_MINUS";
const TIMES: string = "TIMES";
const TIMES_EQUALS: string = "TIMES_EQUALS";
const DIVIDED: string = "DIVIDED";
const BY: string = "BY";
const DIVIDED_BY: string = "DIVIDED_BY";
const DIVIDED_BY_EQUALS: string = "DIVIDED_BY_EQUALS";
const TO: string = "TO";
const THE: string = "THE";
const EXPONENT: string = "EXPONENT";
const EXPONENT_EQUALS: string = "EXPONENT_EQUALS";
const MOD: string = "MOD";
const MOD_EQUALS: string = "MOD_EQUALS";
const LOG: string = "LOG";
const AND: string = "AND";
const OR: string = "OR";
const BITWISE_AND: string = "BITWISE_AND";
const BITWISE_XOR: string = "BITWISE_XOR";
const BITWISE_OR: string = "BITWISE_OR";
const BITWISE_NOT: string = "BITWISE_NOT";

const END_OF_INPUT: string = "END_OF_INPUT";
const VARIABLE: string = "VARIABLE";
const KEYWORD: string = "KEYWORD";
const NUMBER: string = "NUMBER";
const STRING: string = "STRING";
const BOOLEAN: string = "BOOLEAN";
const UNKNOWN: string = "UNKNOWN";

//KEYWORDS
const IS: string = "IS";
const IF: string = "IF";
const ELSE: string = "ELSE";
const WHILE: string = "WHILE";
const DO: string = "DO";
const END: string = "END";
const DEF: string = "DEF";
const RETURN: string = "RETURN";
const WITH: string = "WITH";
const CALL: string = "CALL";
const PRINT: string = "PRINT";
const NEW: string = "NEW";
const MY: string = "MY";
const CLASS: string = "CLASS";
const EXTENDS: string = "EXTENDS";
const WHEN: string = "WHEN";
const CREATED: string = "CREATED";
const STATIC: string = "STATIC";
const IMPORT: string = "IMPORT";
const AS: string = "AS";
const GLOBAL: string = "GLOBAL";

//KEYSUFFIX
const APOSTROPHE: string = "APOSTROPHE";
const APOSTROPHE_S: string = "APOSTROPHE_S";

//PARSE TREE ONLY TYPES (never Lexed)
const START: string = "START";
const FUNC_CALL: string = "FUNC_CALL";
const FUNC_DEF: string = "FUNC_DEF";
const STATIC_FUNC_DEF: string = "STATIC_FUNC_DEF";
const IF_TEST: string = "IF_TEST";
const NEGATIVE: string = "NEGATIVE";
const LIST: string = "LIST";
const DICT: string = "DICT";
const STATEMENT_END: string = "STATEMENT_END";
