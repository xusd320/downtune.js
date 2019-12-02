'use strict';

class factory {

  constructor(worker = 10, container = Infinity) {
    this.worker = worker;
    this.container = container;
    this.working = 0;
    this.worked = 0;
  
  }

  stop() {
    this.container = this.worked;
  }
 
  work(job) {
    ++ this.working;

    const done = (function() {
      -- this.working;
      ++ this.worked;
    }).bind(this);
    process.nextTick(job, done);
  }
  
  run(job) {
    const self = this;
    return new Promise(resolve => {
      const loop = () => {
        if(self.working >= self.worker) {
          setImmediate(loop);
        } else if (self.worked >= self.container) {
          resolve();
        } else {
          self.work(job);
          setImmediate(loop);
        } 
      };
      loop();
    });
  }
  
}

module.exports = factory;
