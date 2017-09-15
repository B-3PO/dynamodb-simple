const AWS = require('aws-sdk');
let db = undefined;

export function setup(accessKey, secret, region, endpoint) {
  AWS.config.update({
    accessKeyId: accessKey,
    secretAccessKey: secret,
    region: region
  });
  db = new AWS.DynamoDB.DocumentClient({ endpoint: endpoint });
}

export function get() {
  return db;
}
