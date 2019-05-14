'use strict';

const fs = require('fs');
const Request = require('request');
const cheerio = require('cheerio');
const log4js = require('log4js');

const fp = require('./fingerprint.js');

const logger = log4js.getLogger();
logger.level = 'debug';

class downtune {

  constructor(rule) {
    if(rule.entry && rule.entry.reqOpt) {
      this.set = new Set();
      this.rule = rule;
      let reqOpt = rule.entry.reqOpt; 
      reqOpt = Array.isArray(reqOpt) ? reqOpt : [ reqOpt ];
      this._more_ = reqOpt.length;
      this.query = reqOpt.map(opt => ({
        reqOpt : opt,
        cmds : this.rule.entry
      }));
    } else {
      throw new Error('no target to fetch');
    }
  }

  async request(opt) {
    const _meta_ = opt._meta_ || {};
    delete opt._meta_;
    logger.info('Request : ', JSON.stringify(opt));
    return new Promise((resolve, reject) => {
      Request(opt, (err, response, body) => {
        if(err) reject(err);
        if(opt.json) resolve(Object.assign({}, body, { _meta_ : _meta_ }));
        const $ = cheerio.load(body);
        $._meta_ = _meta_;
        resolve($);
      }) ;
    });
  }

  download(opt) {
    logger.info('Download : ', JSON.stringify(opt));
    for(const path in opt) {
      try {
        Request(opt[path]).pipe(fs.createWriteStream(path));
      } catch(err){
        throw new Error(err);
      }
    } 
  }

  async handle(task) {
    const cmds = task.cmds;
    const reqOpt = task.reqOpt;
    const fpId = fp(reqOpt);
    if(this.set.has(fpId)) {
      this._more_ -= 1;
      logger.debug(`Already request : ${ JSON.stringify(reqOpt) }`);
      return;
    } 
    this.set.add(fpId);

    try {
      const $ = await this.request(reqOpt);
      this._more_ -= 1;
      if(cmds.link)  {
        const nets = cmds.link($);
        for(const key in nets) {
          const links = Array.isArray(nets[key]) ? nets[key] : [ nets[key] ]; 
          this._more_ += links.length; 
          links.map( link => this.query.push({
            reqOpt : link,
            cmds : this.rule[key]
          }));
        }
      }

      if(cmds.item)  {
        let nets = cmds.item($);
        nets = Array.isArray(nets) ? nets : [ nets ];
        nets.map(opt => this.download(opt)); 
      }
    } catch(err) {
      this.set.delete(fpId);
      err.message = `Error from handler ${JSON.stringify(task.reqOpt)} , ${err.message}`; 
      throw new Error(err);
    }
  }

  async start() {
    const runner = setInterval(async () => {
      if(this._more_ > 0) {
        if(this.query.length) {
          try {   
            const task = this.query.shift();
            await this.handle(task);
          } catch(err) {
            logger.error(err);
          }
        } 
      } else {
        clearInterval(runner);
      }
    }, 50);
  }
}

module.exports = downtune;


