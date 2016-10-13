/**
 * 系统数据库 enterprise
 */

var mongoose = require('mongoose');
var Schema    = mongoose.Schema;
var ObjectId  = Schema.ObjectId;

mongoose.model('Emterprise', new Schema({
    Id: { type: ObjectId },
    Name: { type: String },
    AgentName:{type:String,default:'北京盈美兴科技有限责任公司'},
    TopBarColor:{type:String,default:'#999999'},
    SendAlarmSMS:{type:Boolean,default:false},
    SystemUserId: { type: String },
    Address: { type: String },
    Logo: { type: String },
    Telephone: { type: String },
    Email: { type: String },
    Category: { type: String },
    CreateDateTime: { type: Date, default: Date.now },
    Strategy: { type: String }
}));