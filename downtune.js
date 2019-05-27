'use strict';

const Request = require('request-promise-native');
const cheerio = require('cheerio');
const log4js = require('log4js');

const fp = require('./src/fingerprint');
const factory = require('./src/factory');

const logger = log4js.getLogger();
logger.level = 'debug';

class downtune {

  constructor(rule) {
    if(rule.entry && rule.entry.reqOpt) {
      this.set = new Set();
      this.rule = rule;
      this.timeout = rule.timeout * 1000 || 30000;
      this.concurrency = rule.concurrency || 100;
      this.retry = rule.retry || 100;
      this.ft = new factory(this.concurrency);

      let reqOpt = rule.entry.reqOpt; 
      reqOpt = Array.isArray(reqOpt) ? reqOpt : [ reqOpt ];
      this._more_ = reqOpt.length;
      this.query = reqOpt.map(opt => ({
        reqOpt : opt,
        cmds : this.rule.entry,
        retry: 0,
      }));
    } else {
      throw new Error('no target to fetch');
    }
  }

  async request(opt) {
    opt = typeof opt === 'string' ? { 
      url : opt 
    } : opt; 
    opt.resolveWithFullResponse = true;
    opt.timeout = this.timeout;
    const _meta_ = opt._meta_ || {};
    delete opt._meta_;
    logger.info('Request : ', JSON.stringify(opt));
    try {
      const response = await Request(opt); 
      const $ = opt.json ? response.body : cheerio.load(response.body);
      $._meta_ = _meta_;
      $._header_ = response.headers;
      return $;
    } catch(err) {
      throw new Error(err);
    }
  }

  async handle(task) {
    const cmds = task.cmds;
    const reqOpt = task.reqOpt;
    const fpId = fp(reqOpt);
    const retry = task.retry;

    if(this.set.has(fpId)) {
      this._more_ -= 1;
      logger.debug(`Already request : ${ JSON.stringify(reqOpt) }`);
      return;
    } 
    
    if(retry > this.retry) {
      this._more_ -= 1;
      this.set.add(fpId);
      logger.debug(`Reach max retry, Request : ${ JSON.stringify(reqOpt) }`);
      return;
    }

    try {
      const $ = await this.request(reqOpt);
      if(cmds.link)  {
        const nets = cmds.link($);
        for(const key in nets) {
          let links = Array.isArray(nets[key]) ? nets[key] : [ nets[key] ]; 
          links = links.filter( req => ! this.set.has(fp(req)) );
          this._more_ += links.length; 
          links.map( link => this.query.push({
            reqOpt : link,
            cmds : this.rule[key],
            retry: 0,
          }));
        }
      }

      if(cmds.item)  {
        logger.info(`Processing item from : ${ JSON.stringify(reqOpt) }`);
        await cmds.item($);
      }
      
      this._more_ -= 1;
      this.set.add(fpId);
    } catch(err) {
      this.set.delete(fpId);
      this.query.push(Object.assign({}, task, { retry: retry + 1}));
      err.message = `Error from handler ${JSON.stringify(task.reqOpt)} , ${err.message}`; 
      logger.error(new Error(err));
    }
  }

  async start() {
    await this.ft.run(done => {
      if(this._more_ > 0) {
        if(this.query.length > 0) {
          try {
            const task = this.query.shift();
            this.handle(task).then(() => done());
          } catch(err) {
            throw new Error(err);  
          }
        } else {
          done();
        }
      } else {
        this.ft.stop();
      }
    });
  }
}

module.exports = downtune;


