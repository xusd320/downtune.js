'use strict';
const url = require('url');
const downtune = require('../downtune.js');
const request = require('request');
const fs = require('fs');

const host = 'https://www.coolapk.com/';

const coolapk = {
  concurrency: 10,
  retry : 2,
  timeout : 10,
  entry: {
    reqOpt : 'https://www.coolapk.com/',
    link : $ => ({
      list :  url.resolve(host, $('#navbar-apk a').attr('href'))
    })
  },
  list : {
    link : $ => ({ 
      app : $('.type_tag a').map((i, e) => encodeURI(url.resolve(host, $(e).attr('href')))).get().slice(0,5)
    })
  }, 
  app : {
    link : $ => ({ 
      apk : url.resolve(host, $('.app_list_left a').eq(0).attr('href'))
    })
  }, 
  apk : {
    item : async $ => { 
      const path = './' +  $('.detail_app_title').text().replace(/\s/g,'-').replace(/\//g,'.') + '.apk';
      const uri = $('script:contains(onDownloadApk)').text().match('"(.*from=click)"')[1];
      console.log(`Downloading item : ${ path } : ${ uri }`);
    }
  } 
};

const D = new downtune(coolapk);
D.start().then(() => console.log('finish'));
