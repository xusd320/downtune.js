'use strict';
const url = require('url');
const downtune = require('./downtone.js');

const host = 'https://www.coolapk.com/';

const coolapk = {
  entry: {
    reqOpt : 'https://www.coolapk.com/',
    link : $ => ({
      app :  url.resolve(host, $('#navbar-apk a').attr('href'))
    })
  },
  app : {
    link : $ => ({ 
      input : url.resolve(host, encodeURI($('.type_tag a:contains(输入法)').attr('href')))
    })
  }, 
  input : {
    link : $ => ({ 
      detail : url.resolve(host, $('.app_list_left a').eq(0).attr('href'))
    })
  }, 
  detail : {
    item : $ => ({ 
      './baiduInput.apk' : $('script:contains(onDownloadApk)').text().match('\'(.*from-web)\'')[1]
    })
  } 
};

const D = new downtune(coolapk);
D.start();
