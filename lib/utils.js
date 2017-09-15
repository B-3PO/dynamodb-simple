export function formatType(type, value) {
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
}

export function formatAttrAlias(attr) {
  return attr.replace(/-/g, '').replace(/\./g, '').replace(/@/g, '')
}

export function fixCallback(callback) {
  if (typeof callback !== 'function') callback = noop;
  return callback;
}

export function noop() {}
