'use strict';
const factory = require('../src/factory.js');

const f = new factory(100);

let max = 1000;

f.run(done => {
  max --;
  if(max === 0) f.stop();
   else setTimeout(done,1000);
}).then(() => {
  console.log('===== finish =====');
  clearInterval(inter);
});

const inter = setInterval(() => console.log(max), 1000);
