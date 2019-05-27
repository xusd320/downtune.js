'use strict';
const factory = require('../src/factory.js');

const f = new factory(10);

let max = 1000000;

f.run((done) => {
  max --;
  if(max === 999900) f.stop();
  else setTimeout(done,1000);
  }).then(() => {
    console.log('finish');
    console.log('--------------------------------------');
  });

setInterval(() => console.log(max), 1000);
