const AWS = require('aws-sdk');
let db = new AWS.DynamoDB.DocumentClient();
let dynamodb = new AWS.DynamoDB();

exports.config = function config(obj) {
  AWS.config.update({
    accessKeyId: obj.accessKeyId,
    secretAccessKey: obj.secretAccessKey,
    region: obj.region
  });
  if (obj.endpoint) {
    db = new AWS.DynamoDB.DocumentClient({ endpoint: obj.endpoint });
    dynamodb = new AWS.DynamoDB({ endpoint: obj.endpoint });
  }
};

exports.get = () => db;
exports.getDynamodb = () => dynamodb;
