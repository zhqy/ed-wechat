/*
 * created by 2yuri 15-10-6
 * modify by 2yrui 15-11-19
 */

var mongoose = require('mongoose');
var Schema    = mongoose.Schema;
var ObjectId  = Schema.ObjectId;

var schema = new Schema({
	OpenId:{type:String},
    NickName : {type: String}, // 增加NickName，标示用户
	Blocked:{type:Boolean,default:false},
	LoopControl:{
		Permission : {type : Boolean ,default : false},
		Password : {type : String , default : '123456'} // 默认操作密码
	},
	BindingDateTime :{type : Date , default : new Date()},
	SystemUserId:{type : ObjectId ,ref : 'User'}, //系统用户编号
    
    //修改管理建筑结构 11.20 关联system user
    ManageBuildings : [{building : {type : ObjectId,ref : 'BuildingInfo'}, user : {type : ObjectId}}]
});

// Deep population plugin
var deepPopulate = require('mongoose-deep-populate')(mongoose);
schema.plugin(deepPopulate, null);

mongoose.model('WechatUser',schema);