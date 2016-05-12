var _empty_ = null;
var operator = PLUS || TIMES || MINUS || DIVIDED_BY;
var primary = NUMBER || VARIABLE || (VARIABLE && OPAREN && optExpressionList && CPAREN)
    || (OPAREN && expression && CPAREN);
var expression = (primary && operator && expression) || primary;
var optExpressionList = list || _empty_;
var list = primary || (primary && COMMA && list);
