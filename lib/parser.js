import lexer from './lexer';
import { formatType, formatAttrAlias } from './utils';
const reserved = ['SET', 'AND', 'OR', 'ADD'];

export default function parseQuery(query, hash, range, useKeyCondition) {
  let KeyConditionExpression = '';
  let attributes = {};
  let values = {};
  query = lexer.tokenize(query).reduce((a, b) => {
    if (b[0] === 'LITERAL' && !reserved.includes(b[1])) {
      if (useKeyCondition && hash && b[1] === hash) {
        KeyConditionExpression += ` #${b[1]}`;
      } else if (useKeyCondition && range && b[1] === range) {
        KeyConditionExpression += `, #${b[1]}`;
      } else {
        a += ` #${b[1]}`;
      }
      attributes[`#${b[1]}`] = b[1];
    } else if (b[0] === 'NUMBER' || b[0] === 'DBLSTRING' || b[0] === 'STRING' || b[0] === 'BOOLEAN') {
      let attrAlias = formatAttrAlias(b[1]);
      values[`:${attrAlias}`] = formatType(b[0], b[1]);
      a += ` :${attrAlias}`;
    } else a += ` ${b[1]}`;

    return a;
  }, '');

  let returnObj = {
    FilterExpression: query.trim(),
    ExpressionAttributeNames: attributes,
    ExpressionAttributeValues: values
  };
  if (useKeyCondition) returnObj.KeyConditionExpression = KeyConditionExpression;
  return returnObj;
}
