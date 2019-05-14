'use strict';
const url = require('url');
const downtune = require('./downtune.js');

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
      app : $('.type_tag a').map((i, e) => encodeURI(url.resolve(host, $(e).attr('href')))).get().slice(0,3)
    })
  }, 
  app : {
    link : $ => ({ 
      apk : url.resolve(host, $('.app_list_left a').eq(0).attr('href'))
    })
  }, 
  apk : {
    item : $ => { 
      const data = {};
      const apk = $('.detail_app_title').text().replace(/\s/g,'-').replace(/\//g,'.') + '.apk';
      data[apk] = $('script:contains(onDownloadApk)').text().match('"(.*from=click)"')[1];
      return data;
    }
  } 
};

const D = new downtune(coolapk);
D.start();
