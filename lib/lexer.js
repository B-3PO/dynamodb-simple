const SQL_FUNCTIONS = ['AVG', 'COUNT', 'MIN', 'MAX', 'SUM'];
const SQL_SORT_ORDERS = ['ASC', 'DESC'];
const SQL_OPERATORS = ['=', '!=', '>=', '>', '<=', '<>', '<', 'LIKE', 'IS NOT', 'IS'];
const SUB_SELECT_OP = ['IN', 'NOT IN', 'ANY', 'ALL', 'SOME'];
const SUB_SELECT_UNARY_OP = ['EXISTS'];
const SQL_CONDITIONALS = ['AND', 'OR'];
const BOOLEAN = ['TRUE', 'FALSE', 'NULL'];
const MATH = ['+', '-'];
const MATH_MULTI = ['/', '*'];
const STAR = /^\*/;
const SEPARATOR = /^,/;
const WHITESPACE = /^[ \n\r]+/;
const LITERAL = /^`?([a-z_][a-z0-9_]{0,})`?/i;
const PARAMETER = /^\$[0-9]+/;
const NUMBER = /^[0-9]+(\.[0-9]+)?/;
const STRING = /^'([^\\']*(?:\\.[^\z']*)*)'/;
const DBLSTRING = /^"([^\\"]*(?:\\.[^\\"]*)*)"/;


export const types = ['BOOLEAN', 'NUMBER', 'DBLSTRING', 'STRING'];
export const reserved = []
  .concat(SQL_CONDITIONALS)
  .concat(SUB_SELECT_UNARY_OP)
  .concat(SUB_SELECT_OP)
  .concat(SQL_SORT_ORDERS);

export default function Lexer(sql, opts = {}) {
  let bytesConsumed;
  let tokens = [];
  let currentLine = 1;
  let preserveWhitespace = opts.preserveWhitespace || false;

  let chunk;
  let i = 0;
  while (chunk = sql.slice(i)) {
    bytesConsumed = getbytesConsumed();
    if (bytesConsumed < 1) throw Error("NOTHING CONSUMED: Stopped at - '" + (chunk.slice(0, 30)) + "'");
    i += bytesConsumed;
  }
  token('EOF', '');
  postProcess();

  return tokens;


  function token(name, value) {
    return tokens.push([name, value, currentLine]);
  }

  function postProcess() {
    let ref = tokens;
    let results = [];
    let i = 0;
    let length = tokens.length;
    let token;
    let nextToken;
    for (;i < length; i++) {
      token = ref[i];
      if (token[0] === 'STAR') {
        nextToken = this.tokens[i + 1];

        if (!(nextToken[0] === 'SEPARATOR' || nextToken[0] === 'FROM')) {
          results.push(token[0] = 'MATH_MULTI');
        } else {
          results.push(undefined);
        }
      } else {
        results.push(undefined);
      }
    }
    return results;
  }

  function tokenizeFromRegex(name, regex, part, lengthPart, output) {
    let match;
    let partMatch;
    if (part == null) part = 0;
    if (lengthPart == null) lengthPart = part;
    if (output == null) output = true;
    if (!(match = regex.exec(chunk))) return 0;
    partMatch = match[part];
    if (output) token(name, partMatch);
    return match[lengthPart].length;
  }

  function tokenizeFromWord(name, word) {
    let match;
    let matcher;
    if (word == null) word = name;
    word = regexEscape(word);
    matcher = /^\w+$/.test(word) ? new RegExp("^(" + word + ")\\b", 'ig') : new RegExp("^(" + word + ")", 'ig');
    match = matcher.exec(chunk);
    if (!match) return 0;
    token(name, match[1]);
    return match[1].length;
  }

  function tokenizeFromList(name, list) {
    let entry;
    let ret = 0;
    let i = 0;
    let len = list.length;
    for (; i < len; i++) {
      entry = list[i];
      ret = tokenizeFromWord(name, entry);
      if (ret > 0) break;
    }
    return ret;
  }

  function keywordToken() {
    return tokenizeFromWord('SELECT')
      || tokenizeFromWord('DISTINCT')
      || tokenizeFromWord('FROM')
      || tokenizeFromWord('WHERE')
      || tokenizeFromWord('GROUP')
      || tokenizeFromWord('ORDER')
      || tokenizeFromWord('BY')
      || tokenizeFromWord('HAVING')
      || tokenizeFromWord('LIMIT')
      || tokenizeFromWord('JOIN')
      || tokenizeFromWord('LEFT')
      || tokenizeFromWord('RIGHT')
      || tokenizeFromWord('INNER')
      || tokenizeFromWord('OUTER')
      || tokenizeFromWord('ON')
      || tokenizeFromWord('AS')
      || tokenizeFromWord('UNION')
      || tokenizeFromWord('ALL')
      || tokenizeFromWord('LIMIT')
      || tokenizeFromWord('OFFSET')
      || tokenizeFromWord('FETCH')
      || tokenizeFromWord('ROW')
      || tokenizeFromWord('ROWS')
      || tokenizeFromWord('ONLY')
      || tokenizeFromWord('NEXT')
      || tokenizeFromWord('FIRST');
  }

  function dotToken() {
    return tokenizeFromWord('DOT', '.');
  }

  function operatorToken() {
    return tokenizeFromList('OPERATOR', SQL_OPERATORS);
  }

  function mathToken() {
    return tokenizeFromList('MATH', MATH) || tokenizeFromList('MATH_MULTI', MATH_MULTI);
  }

  function conditionalToken() {
    return tokenizeFromList('CONDITIONAL', SQL_CONDITIONALS);
  }

  function subSelectOpToken() {
    return tokenizeFromList('SUB_SELECT_OP', SUB_SELECT_OP);
  }

  function subSelectUnaryOpToken() {
    return tokenizeFromList('SUB_SELECT_UNARY_OP', SUB_SELECT_UNARY_OP);
  }

  function functionToken() {
    return tokenizeFromList('FUNCTION', SQL_FUNCTIONS);
  }

  function sortOrderToken() {
    return tokenizeFromList('DIRECTION', SQL_SORT_ORDERS);
  }

  function booleanToken() {
    return tokenizeFromList('BOOLEAN', BOOLEAN);
  }

  function starToken() {
    return tokenizeFromRegex('STAR', STAR);
  }

  function seperatorToken() {
    return tokenizeFromRegex('SEPARATOR', SEPARATOR);
  }

  function literalToken() {
    return tokenizeFromRegex('LITERAL', LITERAL, 1, 0);
  }

  function numberToken() {
    return tokenizeFromRegex('NUMBER', NUMBER);
  }

  function parameterToken() {
    return tokenizeFromRegex('PARAMETER', PARAMETER);
  }

  function stringToken() {
    return tokenizeFromRegex('STRING', STRING, 1, 0) || tokenizeFromRegex('DBLSTRING', DBLSTRING, 1, 0);
  }

  function parensToken() {
    return tokenizeFromRegex('LEFT_PAREN', /^\(/) || tokenizeFromRegex('RIGHT_PAREN', /^\)/);
  }

  function windowExtension() {
    let match = /^\.(win):(length|time)/i.exec(chunk);
    if (!match) return 0;
    token('WINDOW', match[1]);
    token('WINDOW_FUNCTION', match[2]);
    return match[0].length;
  }

  function whitespaceToken() {
    let match;
    if (!(match = WHITESPACE.exec(chunk))) return 0;
    let partMatch = match[0];
    let newlines = partMatch.replace(/[^\n]/, '').length;
    currentLine += newlines;
    if (preserveWhitespace) {
      token(name, partMatch);
    }
    return partMatch.length;
  }

  function regexEscape(str) {
    return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  }

  function getbytesConsumed() {
    return keywordToken()
      || starToken()
      || booleanToken()
      || functionToken()
      || windowExtension()
      || sortOrderToken()
      || seperatorToken()
      || operatorToken()
      || mathToken()
      || dotToken()
      || conditionalToken()
      || subSelectOpToken()
      || subSelectUnaryOpToken()
      || numberToken()
      || stringToken()
      || parameterToken()
      || parensToken()
      || whitespaceToken()
      || literalToken();
  }
}
