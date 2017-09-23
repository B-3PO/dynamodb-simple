const { default: lexer, reserved, types} = require('./lexer');
const { formatType, formatAttrAlias } = require('./utils');

exports.default = function parseQuery(query, hash, range, useKeyCondition) {
  let KeyConditionExpression = '';
  let attributes = {};
  let values = {};
  query = lexer(query).reduce((a, b) => {
    if (b[0] === 'LITERAL' && !reserved.includes(b[1])) {
      a += ` #${b[1]}`;
      attributes[`#${b[1]}`] = b[1];
    } else if (types.indexOf(b[0]) !== -1) {
      let attrAlias = formatAttrAlias(b[1]);
      values[`:${attrAlias}`] = formatType(b[0], b[1]);
      a += ` :${attrAlias}`;
    } else a += ` ${b[1]}`;

    return a;
  }, '');

  let returnObj = {
    ExpressionAttributeNames: attributes,
    ExpressionAttributeValues: values
  };
  if (useKeyCondition) returnObj.KeyConditionExpression = query.trim();
  else returnObj.FilterExpression = query.trim();
  return returnObj;
};
