'use strict';
const factory = require('./factory.js');

const f = new factory(10);

let max = 1000000;

f.run((done) => {
  max --;
  setTimeout(done,1000);
  }).then(() => {
    console.log('finish');
    console.log('--------------------------------------');
  });

setTimeout(()=> f.stop(), 10000)
setInterval(() => console.log(max), 1000);
