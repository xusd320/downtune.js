'use strict';

const stringify = require('json-stable-stringify');
const crypto = require('crypto');

module.exports = function fingerprint(request) {
  return crypto.createHash('sha256').update(stringify(request)).digest('hex');
};

