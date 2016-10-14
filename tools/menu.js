/*
 * 微信构建菜单
 */

var ready = require('ready');
var config = require('../config');
var API = require('wechat-api');
var fs = require('fs');
var path = require('path');
var logger = require('../common/logger');
var querystring = require('querystring');

ready(exports);

var createOauthUrl = function(rurl,state){
  var url = 'https://open.weixin.qq.com/connect/oauth2/authorize';
  var info = {
      appid: config.wechat_appid,
      redirect_uri: rurl,
      response_type: 'code',
      scope: 'snsapi_userinfo',
      state: state || ''
    };
  return url + '?' + querystring.stringify(info) + '#wechat_redirect';
}

var menu = exports.build = function(){
  // API
	var api = new API(config.wechat_appid,config.wechat_secret,function(callback){
		fs.readFile(path.join(__dirname,'access_token.txt'), 'utf8', function (err, txt) {
	    	if (err) {return callback(err);}
	    	callback(null, txt && JSON.parse(txt));
  		});
	},function(token,callback){
  		fs.writeFile(path.join(__dirname,'access_token.txt'), JSON.stringify(token), callback);
	});

  // 菜单
  var redirectUrl = config.host + ':8090' + '/web/login';
  // var redirectUrl = 'http://pixelcat.cc';

	var menu = {
			"button":[
				{
					"type":"view",
       		"name":"系统首页",
       		"url": createOauthUrl(redirectUrl)
				}
			]
  };

 // 创建
 api.createMenu(menu,function(err,result){
   if(err){
     console.log('创建微信菜单失败：'+ err.message);
     return;
   }
   // errcode == 0?
   console.log('创建菜单成功');
   exports.ready(true);
 });

};

menu();
