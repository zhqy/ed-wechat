/**
 * 系统数据库-告警
 * Created by 2yuri.
 */

var mongoose = require('mongoose');
var Schema    = mongoose.Schema;
var ObjectId  = Schema.ObjectId;

var AlarmSchema = new Schema({
	IMeterId : {type : ObjectId},
	BuildingInformationId : {type : ObjectId, ref : 'BuildingInfo'},
	EnterpriseId : {type : ObjectId},
	SubType : String,
	Year : Number,
	Month : Number,
	Day : Number,
	Hour : Number,
	Minute : Number,
	CreateDateTime : {type : Date},
	Message : Schema.Types.Mixed,
	EnergySubType :  String
});

mongoose.model('Alarm',AlarmSchema);