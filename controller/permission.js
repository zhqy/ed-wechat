/*
 * permisson control created by 2yuri 15.10.6
 */

var Oauth = require('wechat-oauth');
var config = require('../config');
var path = require('path');
var fs = require('fs');
var eventproxy = require('eventproxy');
var crypto = require('crypto');
var o_user = require('../proxy/user_proxy');
var logger = require('../common/logger');

var oauthClient = new Oauth(config.wechat_appid,config.wechat_secret);

//登陆
exports.getlogin = function(req,res,next){
	var ep = new eventproxy();
	var code = req.query.code;
	var wxid = req.query.wxid;
    
	if (code) {
		oauthClient.getAccessToken(code,function(err,result){
			if (err) {
console.log(err);
				return res.render('notify/notify',{ title : '提示', msg : err.errmsg || '微信接口错误' });
			}
			var openid = result.data.openid;
			o_user.o_wechat.getUserByOpenid(openid,function(err,user){
				if (err) { return next(err); }
				if (!user || !user.SystemUserId) {
                    //判断微信（nickname）是否存在，不存在则获取

                    var nickname = user ? user.NickName : '';
                    if(!nickname){
                        oauthClient.getUser(openid, function (err, result) {
                            if(err){
				                return res.render('notify/notify',{ title : '提示', msg : err.errmsg || '微信接口错误' });
                            }
                            var userInfo = result;
                            nickname = userInfo.nickname;
					        return res.render('permisson/login',{ title : '登陆', openid :  openid, nickname : nickname});
                        });
                    }else{
					   res.render('permisson/login',{ title : '登陆', openid :  openid, nickname : nickname});
                    }
				}else{
					// 状态码 301
					res.redirect(301,'index?wxid=' + openid + '&xtid=' + user.SystemUserId);
				}
			});
		});
	}else if(wxid){
		res.render('permisson/login',{ title : '登陆', openid :  wxid});
	}
};

//
exports.postlogin = function(req,res,next){
	var openid = req.body.openid;
    var nickname = req.body.nickname;
	var username = req.body.username;
	var password = req.body.password;
	var ep = new eventproxy();

	var render = function(msg){
		return res.render('permisson/login',{title : '登陆',openid : openid,error : msg});
	};
    
	ep.on('login_error',function(){
		return render("用户名或者密码错误");
	});
	if (!openid || !username || !password) {
		return render('信息不完整');
	}
    
	o_user.o_system.getUserByUserName(username,function(err,user){
		if (err) { return next(err); }
		if (user) {
			var pwd = user.Password;
			password = crypto.createHash("md5").update(password).digest('hex');
			if (password !== pwd) {
				return ep.emit('login_error');
			}
			o_user.o_wechat.updateSystemUser(openid,nickname,user._id,function(err){
				if (err) { return next(err); };
				return res.redirect(301,'index?wxid=' + openid + '&xtid=' + user._id);
			});
		}else{ 
			ep.emit('login_error');
		}
	});
};

exports.getcontrolpasswordlogin = function(req,res,next){
	var wxid = req.query.wxid,
		xtid = req.query.xtid,
		sbid = req.query.sbid,
		loopid = req.query.loopid;

	res.render('permisson/loopcontrol',{title : "控制密码", wxid : wxid, xtid : xtid, sbid : sbid, loopid : loopid});
};

/**
 * post loop control
 */
// modify by 2yuri.

var config = require('../config');
var loopcontrolhelper = require('../tools/loopcontrolhelper')({
 host : config.websocketServer.host,
 port: config.websocketServer.port
});

exports.postcontrolpasswordlogin = function(req,res,next){

/******************* loop control ***********************/
	var _isdc_addr = req.query.sid
		, _itru_addr = req.query.irtu
		, _cno = req.query._ctrlno;

	var wxid = req.body.wxid;
	var xtid = req.body.xtid;
	var ep = new eventproxy();
	ep.on('password_wrong',function(){
		res.render('permisson/loopcontrol',{title : "控制密码" , error : true , wxid : wxid, xtid : xtid});
	})
	// var j = 0,password = [];
	// while(j < 6){ password.push(req.body["IPInput" + j]); j++;}
	// password = password.join('').trim();
	// logger.debug(password);
	//debug
	logger.debug(wxid);
  var password = req.body.mInput.trim();
	if (password.length != 6) {
		return ep.emit('password_wrong');
	}
	o_user.o_wechat.getUserByOpenid(wxid,function(err,user){
		if (err) {return next(err);}
		if (user && user.LoopControl.Permission) {
			var pass = user.LoopControl.Password;
            //暂时不做密码加密
			//password = crypto.createHash("md5").update(password).digest('hex');
			if (pass === password) {
				//回路控制功能待完善
      	// TODO
				//
				loopcontrolhelper.request({
					sid : _isdc_addr,
					payload : {
					irtu : parseInt(_itru_addr),
					op : 0x01, //断开
					cno : parseInt(_cno)
					}
				},function(err,ret){
					console.log('>>> 回路已经断开');
					console.log(ret);
					if (err) { return next(err)};
					res.render('notify/notify',{title:'提示',msg : '已经断开回路，即将跳转',wxid : wxid, xtid : xtid, scripts : ['pages/permisson/looptank_broke']});
				});
				// res.render('notify/notify',{title:'提示',msg : '已经断开回路，即将跳转',wxid : wxid, xtid : xtid, scripts : ['pages/permisson/looptank_broke']});
			}else{
				ep.emit('password_wrong');
			}
		}
	});
};
//修改密码
exports.getnewpw = function(req,res,next){
    var wxid = req.query.wxid;
    var xtid = req.query.xtid;
    
    res.render('permisson/new_pw',{title :'更改密码', wxid : wxid, xtid : xtid});
}
exports.postnewpw = function(req,res,next){
    var wxid = req.query.wxid;
    var xtid = req.query.xtid;
    
    var j = 0,password = [];
	while(j < 6){ password.push(req.body["IPInput" + j]); j++;}
	password = password.join('').trim();
    
    if(password.length != 6){
        return res.render('permisson/new_pw',{title :'更改密码', wxid : wxid, xtid : xtid, error : true});        
    }
    return res.redirect(301,'/web/pw_confirm?wxid=' + wxid + '&xtid=' + xtid + '&pw=' + password);
}

//确认密码
exports.getpwconfirm = function(req,res,next){
    var wxid = req.query.wxid;
    var xtid = req.query.xtid;
    var pw = req.query.pw;
    
    res.render('permisson/pw_confirm',{title :'确认密码', wxid : wxid, xtid : xtid, pw : pw});
}
exports.postpwconfirm = function(req,res,next){
    var wxid = req.query.wxid;
    var xtid = req.query.xtid;
    var pw = req.query.pw;
    
    var j = 0,password = [];
	while(j < 6){ password.push(req.body["IPInput" + j]); j++;}
	password = password.join('').trim();
    
    if(password.length != 6){
        return res.render('permisson/pw_confirm',{title :'确认密码', wxid : wxid, xtid : xtid, pw : pw, checkError : true});
    }
    if(password != pw){
        return res.render('permisson/pw_confirm',{title :'确认密码', wxid : wxid, xtid : xtid, pw : pw, matchError : true});
    }
    //更新密码
    o_user.o_wechat.getUserByOpenid(wxid,function(err,user){
		if (err) {return next(err);}
		if (user && user.LoopControl.Permission) {
			user.LoopControl.Password = password;
			user.save(function(err,ret){
                if(err){
                    return next(err);
                }
                return res.render('notify/notify',{title : '提示', msg : '密码修改成功，即将跳转', wxid : wxid, xtid : xtid, scripts : ['pages/permisson/pw_confirm']});
            })
		}else{
            res.render('notify/notify',{title : '提示', msg : '您无权更改密码'});
        }
	});
}
