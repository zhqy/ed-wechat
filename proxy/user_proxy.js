// user proxy
// 2yuri.

var WechatUser = require('../models').WechatUser;
var SystemUser = require('../models').SystemUser;
var Enterprise = require('../models').Enterprise;
var logger = require('../common/logger');

var o_wechat = {
	getUserByOpenid : function(id,callback){
		WechatUser.findOne({OpenId : id}).exec(callback);
	},
    //不用更改 11.18
    //修改，增加nickname
	updateSystemUser : function(openid,nickname,uid,callback){
		WechatUser.findOne({OpenId : openid}).exec(function(err,wechatuser){
			if (err) {
				return callback(err);
			}
			if (!wechatuser) {
				var user = new WechatUser({
					OpenId : openid,
                    NickName : nickname,
					SystemUserId : uid,
					ManageBuildings: []
				});
				user.save(callback);
			}else{
				wechatuser.SystemUserId = uid;
				wechatuser.BindingDateTime = new Date();
				wechatuser.save(callback);
			}
		});
	},
    // 修改
	// getManageBuildingsByOpenid : function(openid,callback){
    //     console.log(openid);
	// 	// notion populate params.
	// 	WechatUser.findOne({OpenId : openid}).populate('ManageBuildings').exec(function(err,user){
	// 		// logger.debug(user.ManageBuildings);
	// 		callback(err,user.ManageBuildings);
	// 	})
	// },
    // new 11.18
    getManageBuildingsByOpenid : function(openid,systemid,callback){
        console.log(openid);
		// notion populate params.
		WechatUser.findOne({OpenId : openid}).deepPopulate('ManageBuildings.building').exec(function(err,user){
			// logger.debug(user.ManageBuildings);
			//callback(err,user.ManageBuildings);
            if(err){
                return callback(err);
            }
            if(user && user.ManageBuildings && user.ManageBuildings.length > 0){
                var all = user.ManageBuildings;
                var ret = [];
                for(var i= 0;i<all.length;i++){
                    if(all[i].user == systemid){
                        ret.push(all[i].building);
                    }
                }
                callback(null,ret);
            }else{
                return callback(null,[]);
            }
		});
	},
	getUserAllinfoByOpenid : function(id,callback){
		WechatUser.findOne({OpenId : id}).populate('SystemUserId','EnterpriseId Name').exec(function(err,user){
			logger.debug(user);
            // Mod 12.06
            if(err){
                return callback(err);
            }
            if(user && user.SystemUserId){
                var enterpriseId = user.SystemUserId.EnterpriseId;
                Enterprise.findById(enterpriseId).exec(function(err,e){
                    if(err){
                        return callback(err);
                    }
                    callback(null,{wechat : user, enterprise : (e ? e.Name : '')});
                })
            }else{
                callback(null,null);
            }
		});
	},
	checkControlPermission : function(id,callback){
		WechatUser.findOne({OpenId : id},'LoopControl',function(err,ret){
			if (!err) {
				logger.debug(ret);
				var cp = ret.LoopControl.Permission;
				logger.debug(cp);
				callback(null,cp);
			}else{
				callback(err);
			}
		})
	}
};

var o_system = {
	getUserByUserName : function(username,callback){
		SystemUser.findOne({Name : username}).exec(callback);
	}
};
module.exports = {
	o_wechat : o_wechat,
	o_system : o_system
}