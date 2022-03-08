# downtune.js
A web crawler based on nodejs, supports concurrency control, url deduplication, request retry and etc..., anything else which [request](https://www.npmjs.com/package/request) supports.

Parse html with [cheerio](https://www.npmjs.com/package/cheerio) which works like jQuery selector, is compatible with json response.

Look over the ./test/test.js or ***npm run test***  for example. 

We can use it to generate a web spider like blow:

```js
'use strict';
const url = require('url');
const downtune = require('downtune.js');
const fs = require('fs');

const host = 'https://www.coolapk.com/';

const coolapk = {
  log_level: 'debug', // log_level:
  concurrency: 10, // concurrency control
  retry : 10, // max retry times for failed request
  timeout : 10, // request timeout use seconds
  entry: {    // entry config
  reqOpt : 'https://www.coolapk.com/', // request options like url, headers, method\(GET or POST\), proxy and etc...
    link : $ => ({  // crawler will extract urls from webpage by 'link' property and add these urls to crawler urls queue, $ is a cheerio instance
      list :  url.resolve(host, $('#navbar-apk a').attr('href')) // 'list' property as a tag for specific classification of some webpage those share some common features
    })
  },
  list : {
    link : $ => ({
      app1 : $('.type_tag a').map((i, e) => encodeURI(url.resolve(host, $(e).attr('href')))).get().slice(0, 5),
      app2 : $('.type_tag a').map((i, e) => encodeURI(url.resolve(host, $(e).attr('href')))).get().slice(6, 10)
    })
  },
  app1 : {
    link : $ => ({ 
      apk : url.resolve(host, $('.app_list_left a').eq(0).attr('href'))
    })
  }, 
  app2 : {
    link : $ => ({ 
      apk : url.resolve(host, $('.app_list_left a').eq(0).attr('href'))
    })
  }, 
  apk : {
    item : async $ => { // crawler will deal with 'item' property as information you want to extract from webpage, you can make custom procedure as you want. 
      const path = './' +  $('.detail_app_title').text().replace(/\s/g,'-').replace(/\//g,'.') + '.apk';
      const uri = $('script:contains(onDownloadApk)').text().match('"(.*from=click)"')[1];
      console.log(`Downloading item : ${ path } : ${ uri }`);
    }
  }
};

const D = new downtune(coolapk);
D.start().then(() => console.log('finish'));
```
