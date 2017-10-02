exports.formatType = function formatType(type, value) {
  switch(type) {
    case 'NUMBER':
      return parseFloat(value);
    case 'BOOLEAN':
      if (value === 'null') return null;
      if (value === 'true') return true;
      if (value === 'false') return false;
    default:
      return value;
  }
};

exports.formatAttrAlias = function formatAttrAlias(attr) {
  return attr.trim().replace(/-/g, '').replace(/\./g, '').replace(/@/g, '').replace(/\+/g, '').replace('/\s/g', '').replace(/ /g,'');
};

exports.fixCallback = function fixCallback(callback) {
  if (typeof callback !== 'function') callback = exports.noop;
  return callback;
};

exports.noop = function noop() {};
