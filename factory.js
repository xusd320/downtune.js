'use strict';
const log4js = require('log4js');

class factory {

  constructor(container = 100, worker = 10) {
    this.container = container;
    this.worker = worker;
    this.working = 0;
    this.worked = 0;

    this.logger = log4js.getLogger();
    this.logger.level = 'info';
    this.logger.info(container, worker);
  }

  start() {
    this.working += 1;
    this.logger.info(`one work started, worker ${this.working} is working`);
  }

  finish() {
    this.working -= 1;
    this.worked += 1;
    this.logger.info(`one work finished, worker ${this.working} is working`);
  }

   
  work(job) {
    const done = this.finish.bind(this);
    this.start();
    job(done);
  }

  async run(job) {
    if(this.working >= this.worker) {
      //return 'assigned workers are occupied';
    } else if(this.worked >= this.container)  {
      return 'all finished';
    } else {
      await this.work(job);
      return this.run(job);
    }
  }
}

module.exports = factory;
