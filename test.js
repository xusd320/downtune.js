'use strict';
const url = require('url');
const downtune = require('./downtune.js');
const request = require('request');
const fs = require('fs');

const host = 'https://www.coolapk.com/';

const coolapk = {
  entry: {
    reqOpt : 'https://www.coolapk.com/',
    link : $ => ({
      list :  url.resolve(host, $('#navbar-apk a').attr('href'))
    })
  },
  list : {
    link : $ => ({ 
      app : $('.type_tag a').map((i, e) => encodeURI(url.resolve(host, $(e).attr('href')))).get().slice(0,10)
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
      request(uri).pipe(fs.createWriteStream(path));
    }
  } 
};

const D = new downtune(coolapk);
D.start();
