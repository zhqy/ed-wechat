/**
 * 系统数据库 user
 */

var mongoose = require('mongoose');
var Schema    = mongoose.Schema;
var ObjectId  = Schema.ObjectId;

var user_schema = new Schema({
	Id: { type: ObjectId },         
    EnterpriseId: { type: ObjectId }, 
    DepartmentId: { type: ObjectId }, 
    JobTitle: { type: String },   
    Role_Id: { type: ObjectId },
    Name: { type: String },
    Password: { type: String }, 
    CreateId: { type: ObjectId },
    Email: { type: String },
    PhoneNumber: { type: String },
    IsAdministrator:{type:Boolean,default:false},
    CreateDateTime: { type: Date, default: Date.now }
});

mongoose.model('User',user_schema);