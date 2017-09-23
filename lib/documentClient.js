const { noop, fixCallback } = require('./utils');
const { config: configDB, get: getDB, getDynamodb } = require('./db');
const { default: parseQuery } = require('./parser');

exports.config = configDB;
exports.createTable = createTable;
exports.listTables = listTables;
exports.deleteTable = deleteTable;
exports.describeTable = describeTable;
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


function createTable(tableName, hash, ...rest) {
  let callback = rest[rest.length-1];
  if (typeof callback !== 'function') callback = noop;
  let params = rest[1] && typeof rest[1] === 'object' ? rest[1] : {};
  let range = typeof rest[0] === 'string' ? rest[0] : undefined;

  params.TableName = tableName;

  let isHashObj = typeof hash === 'object';
  let hashName = isHashObj && hash.name ? hash.name : hash;
  let hashType = isHashObj && hash.type ? hash.type : 'S';
  params.KeySchema = [{
    AttributeName: hashName,
    KeyType: 'HASH'
  }];
  params.AttributeDefinitions = [{
    AttributeName: hashName,
    AttributeType: hashType
  }];

  if (range) {
    let isHashObj = typeof range === 'object';
    let rangeName = isHashObj && range.name ? range.name : range;
    let rangeType = isHashObj && range.type ? range.type : 'S';
    params.KeySchema.push({
      AttributeName: rangeName,
      KeyType: 'RANGE'
    });

    params.AttributeDefinitions.push({
      AttributeName: rangeName,
      AttributeType: rangeType
    });
  }

  if (!params.ProvisionedThroughput) {
    params.ProvisionedThroughput = {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1
    }
  }
  getDynamodb().createTable(params, callback);
}


function listTables(callback = noop) {
  getDynamodb().listTables({}, callback);
}

function deleteTable(table, callback = nopp) {
  getDynamodb().deleteTable({ TableName: table }, callback);
}

function describeTable(table, callback = nopp) {
  getDynamodb().describeTable({ TableName: table }, callback);
}
