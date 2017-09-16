const { noop, fixCallback } = require('./utils');
const { config: configDB, get: getDB } = require('./db');
const { default: parseQuery } = require('./parser');

exports.config = configDB;
exports.table = function wrap(table, hash, range) {
  return {
    scan: scan(table),
    query: query(table, hash, range),
    get: get(table, hash, range),
    put: put(table, hash, range),
    update: update(table, hash, range),
    delete: del(table, hash, range)
  };
};

function scan(table) {
  return (query, callback = noop) => {
    getDB().scan(Object.assign({ TableName: table }, parseQuery(query)), callback);
  };
};

function query(table, hash, range) {
  return (query, callback = noop) => {
    getDB().query(Object.assign({ TableName: table }, parseQuery(query, hash, range, true)), callback);
  };
};

function get(table, hash, range) {
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

function put(table) {
  return (item, callback = noop) => {
    getDB().put({
      TableName: table,
      Item: item
    }, callback);
  };
};

function update(table, hash, range) {
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

function del(table, hash, range) {
  return (hashValue, rangeValue) => {
    let Key = {};
    Key[hash] = hashValue;
    if (range && rangeValue !== undefined) Key[range] = rangeValue;
    getDB().delete({
      TableName: table,
      Key: Key
    }, fixCallback(arguments[arguments.length-1]));
  };
};
