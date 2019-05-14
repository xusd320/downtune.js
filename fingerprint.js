'use strict';

const stringify = require('json-stable-stringify');
const crypto = require('crypto');

module.exports = function fingerprint(request) {
  const reqStr = stringify(request); 
  const hash = crypto.createHash('sha256');
  hash.update(reqStr);
  const hex = hash.digest('hex');
  return hex;
};

