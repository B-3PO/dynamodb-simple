# dynamodb-simple
A simple and elegant interface for aws-sdk dynamodb documentClient


# Usage
You can reference [aws DocumentClient documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#query-property) to get a better understanding of how these methods work under the hood

## config
setup aws config
You can skip this step if you already have credentials setup for aws-sdk
```javascript
const dynamodbSimple = require('dynamodb-simple');

dynamodbSimple.config({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  endpoint: process.env.DYNAMODB_ENDPOINT
});
```

## table
Create a table instance;
```javascript
const dynamodbSimple = require('dynamodb-simple');

// with just hash
// table name, hash name, range name
const userTable = dynamodbSimple.table('user', 'id');

// with hash and range
const userTable = dynamodbSimple.table('user', 'id', 'age');
```


## scan
`FilterExpression` queries
[FilterExpression Documentation](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html#FilteringResults)

```javascript
const dynamodbSimple = require('dynamodb-simple');
const userTable = dynamodbSimple.table('user', 'id');
const userId = 1; // hash
const name = 'Ben';
const age = '30';

// scan using single attr
userTable.scan(`id = '${userId}'`, (err, doc) => {
  if (err) return console.log(err);
  console.log(doc);
});

// scan using multiple attr
userTable.scan(`name = '${name}' AND age = ${age}`, (err, doc) => {
  if (err) return console.log(err);
  console.log(doc);
});
```

## query
Query using hash and range to find data. You can configure a table to use just hash or both hash and range
Write `KeyConditionExpression` queries
[KeyConditionExpression Documentation](http://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Query.html#DDB-Query-request-KeyConditionExpression)
```javascript
const dynamodbSimple = require('dynamodb-simple');
const userId = 1; // hash
const age = '30'; // range
const name = 'ben';

// query using just hash. This is dependent on how your table is configured
const userTable = dynamodbSimple.table('user', 'id');
dynamodbSimple.scan(`id = '${userId}'`, (err, doc) => {
  if (err) return console.log(err);
  console.log(doc);
});

// query using hash and range. This is dependent on how your table is configured
const userTableWithRange = dynamodbSimple.table('user', 'id', 'age');
userTableWithRange.scan(`id = '${userId}' AND age = ${age}`, (err, doc) => {
  if (err) return console.log(err);
  console.log(doc);
});

// query using hash and range with other attributes. This is dependent on how your table is configured
userTableWithRange.scan(`id = '${userId}' AND age = ${age} AND name = '${name}'`, (err, doc) => {
  if (err) return console.log(err);
  console.log(doc);
});
```


## get
Get using hash and range to find data. You can configure a table to use just hash or both hash and range
```javascript
const dynamodbSimple = require('dynamodb-simple');
const userId = 1; // hash
const age = '30'; // range

// get using just hash. This is dependent on how your table is configured
const userTable = dynamodbSimple.table('user', 'id');
userTable.get(userId, (err, doc) => {
  if (err) return console.log(err);
  console.log(doc);
});

// get using hash and range. This is dependent on how your table is configured
const userTableWithRange = dynamodbSimple.table('user', 'id', 'age');
userTableWithRange.get(userId, age, (err, doc) => {
  if (err) return console.log(err);
  console.log(doc);
});
```

## put
Put data
```javascript
const dynamodbSimple = require('dynamodb-simple');
const userTable = dynamodbSimple.table('user', 'id');

// get using just hash. This is dependent on how your table is configured
let newUser = {
  name: 'ben',
  age: 30
};
userTable.put(newUser, err => {
  if (err) return console.log(err);
});
```

## update
Put data
```javascript
const dynamodbSimple = require('dynamodb-simple');
const userTable = dynamodbSimple.table('user', 'id');
const userId = 1; // hash
const newName = 'Colton';
const bestFriend = 'Rich';

// update 1 property
userTable.update(`SET name = '${newName}'`, userId, err => {
  if (err) return console.log(err);
});

// update multiple properties
userTable.update(`SET name = '${newName}', bestFriend = '${bestFriend}', employee = true`, userId, err => {
  if (err) return console.log(err);
});
```

## delete
Delete data
```javascript
const dynamodbSimple = require('dynamodb-simple');
const userId = 1;
const age = 30;

// get using just hash. This is dependent on how your table is configured
const userTable = dynamodbSimple.table('user', 'id');
userTable.delete(userId, (err, doc) => {
  if (err) return console.log(err);
  console.log(doc);
});

// get using hash and range. This is dependent on how your table is configured
const userTableWithRange = dynamodbSimple.table('user', 'id', 'range');
userTableWithRange.delete(userId, age, (err, doc) => {
  if (err) return console.log(err);
  console.log(doc);
});
```
