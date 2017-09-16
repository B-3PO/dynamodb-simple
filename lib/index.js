const { setup } = require('./db');
const dc = require('./documentClient');

exports.default = function (config = {}) {
  setup(
    config.accessKey || 'cUniqueSessionID',
    config.secret || 'SECRET',
    config.region || 'us-west-2',
    config.endpoint || 'http://localhost:8000'
  );
  return dc;
}
