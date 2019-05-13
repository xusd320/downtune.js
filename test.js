'use strict';
const factory = require('./factory.js');

function delay(time) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time); 
  });
}

delay(500).then(() => console.log('delay success'));

const f = new factory(50, 5);

f.run(done => { 
  const t =   1000;
  //done.f();
  delay(t).then(() => console.log(done));
}
).then(re => console.log(`hhh ${re}`));
