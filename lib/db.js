const AWS = require('aws-sdk');
let db = new AWS.DynamoDB.DocumentClient();

exports.config = function config(obj) {
  AWS.config.update({
    accessKeyId: obj.accessKey,
    secretAccessKey: obj.secret,
    region: obj.region
  });
  if (obj.endpoint) db = new AWS.DynamoDB.DocumentClient({ endpoint: obj.endpoint });
};

exports.get = function get() {
  return db;
};
