import { noop, fixCallback } from './utils';
import { get as getDB } from './db';
import parseQuery from './parser';

export default function wrapper(table, hash, range) {
  return {
    scan: scann(table),
    query: query(table, hash, range),
    get: get(table, hash, range),
    put: put(table, hash, range),
    update: update(table, hash, range),
    del: del(table, hash, range)
  };
}

export function scan(table) {
  return (query, callback = noop) => {
    db.scan(Object.assign(obj, parseQuery(query)), callback);
  };
}

export function query(table, hash, range) {
  return (query, callback = noop) => {
    db.query(Object.assign({ TableName: table }, parseQuery(query, hash, range, true)), callback);
  };
}

export function get(table, hash, range) {
  return (hashValue, rangeValue) => {
    let Key = {};
    Key[hash] = hashValue;
    if (range && rangeValue !== undefined) Key[range] = rangeValue;
    getDB().get({
      TableName: table,
      Key: Key
    }, fixCallback(arguments[arguments.length-1]));
  };
}

export function put(table) {
  return (item, callback = noop) => {
    db.put({
      TableName: table,
      Item: item
    }, callback);
  };
}

export function update(table, hash, range) {
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
    db.update(Object.assign({ TableName: table, Key: Key }, data), fixCallback(callback));
  };
}

export function del(table, hash, range) {
  return (item, hashValue, rangeValue) => {
    let Key = {};
    Key[hash] = hashValue;
    if (range && rangeValue !== undefined) Key[range] = rangeValue;
    db.delete({
      TableName: table,
      Key: Key
    }, fixCallback(arguments[arguments.length-1]));
  };
}
