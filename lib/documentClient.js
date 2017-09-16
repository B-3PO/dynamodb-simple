const { noop, fixCallback } = require('./utils');
const { config: configDB, get: getDB } = require('./db');
const parseQuery = require('./parser');

exports.config = configDB;
exports.wrap = function wrap(table, hash, range) {
  return {
    scan: exports.scan(table),
    query: exports.query(table, hash, range),
    get: exports.get(table, hash, range),
    put: exports.put(table, hash, range),
    update: exports.update(table, hash, range),
    del: exports.del(table, hash, range)
  };
};

exports.scan = function scan(table) {
  return (query, callback = noop) => {
    getDB().scan(Object.assign(obj, parseQuery(query)), callback);
  };
};

exports.query = function query(table, hash, range) {
  return (query, callback = noop) => {
    getDB().query(Object.assign({ TableName: table }, parseQuery(query, hash, range, true)), callback);
  };
};

exports.get = function get(table, hash, range) {
  return (hashValue, rangeValue) => {
    let Key = {};
    Key[hash] = hashValue;
    if (range && rangeValue !== undefined) Key[range] = rangeValue;
    getDB().get({
      TableName: table,
      Key: Key
    }, fixCallback(arguments[arguments.length-1]));
  };
};

exports.put = function put(table) {
  return (item, callback = noop) => {
    getDB().put({
      TableName: table,
      Item: item
    }, callback);
  };
};

exports.update = function update(table, hash, range) {
  return (query, hashValue, rangeValue, callback) => {
    callback = typeof rangeValue === 'function' ? rangeValue : callback;
    let Key = {};
    Key[hash] = hashValue;
    if (range && rangeValue !== undefined) Key[range] = rangeValue;
    let data = {
      FilterExpression: UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues
    } = parseQuery(query);
    getDB().update(Object.assign({ TableName: table, Key: Key }, data), fixCallback(callback));
  };
};

exports.del = function del(table, hash, range) {
  return (item, hashValue, rangeValue) => {
    let Key = {};
    Key[hash] = hashValue;
    if (range && rangeValue !== undefined) Key[range] = rangeValue;
    getDB().delete({
      TableName: table,
      Key: Key
    }, fixCallback(arguments[arguments.length-1]));
  };
};
