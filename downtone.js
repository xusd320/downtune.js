'use strict';

const fs = require('fs');
const Request = require('request');
const cheerio = require('cheerio');
const log4js = require('log4js');

const logger = log4js.getLogger();
logger.level = 'info';

class downtune {

  constructor(rule) {
    if(rule.entry && rule.entry.reqOpt) {
      this.rule = rule;
      this.query = [{
        reqOpt : this.rule.entry.reqOpt,
        cmds : this.rule.entry
      }];
    } else {
      throw new Error('no target to fetch');
    }
  }

  async request(opt) {
    logger.info('Request : ', opt);
    return new Promise((resolve, reject) => {
      Request(opt, (err, response, body) => {
        if(err) reject(err);
        const $ = cheerio.load(body);
        resolve($);
      }) ;
    });
  }

  download(opt) {
    logger.info('Download : ', Object.values(opt).join());
    for(const path in opt) {
      try {
        Request(opt[path]).pipe(fs.createWriteStream(path));
      } catch(err){
        throw  new Error(err);
      }
    } 
  }


  async start() {
    while(this.query.length) {
      try { 
        const task = this.query.shift();
        const cmds = task.cmds;
        const $ = await this.request(task.reqOpt);
        if(cmds.link)  {
          const nets = cmds.link($);
          for(const key in nets) {
            const links = Array.isArray(nets[key]) ? nets[key] : [ nets[key] ]; 
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
        logger.error(err);
      }
    }
  }
}

module.exports = downtune;


