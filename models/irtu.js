var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

mongoose.model('IRTU', new Schema({
    Id: { type: ObjectId },
    Name: { type: String },
    BoxNo: { type: String },
    BuildingInfomationId: { type: ObjectId },
    Address: { type: String },
    CustomNO: { type: Number },
    Description: { type: String },
    EnterpriseId: { type: ObjectId },
    ISDCInfomationId: { type: ObjectId },
    //ThresholdValue: { type: String },
    Floor: { type: Number, default: 0 },
    CreateDateTime: { type: Date, default: Date.now },
    IsVirtual: { type: Number },//"1"是虚拟， "0" 不是虚拟
    VirtualConfig:{type:Number,default:0}, // 二进制：11（00 1200bps,01 2400bps 10 4800 11 9600） 11(00 无校验、10奇校验，11偶校验)  1几个停止位（0 1个，1 2个） 111 COM1-COM5
    //控制
    IsControl : {type : Number},//'1'是控制irtu，'0'不是控制
    ConfigureInformation : {type : [new Schema({ No: String, Name: String})], default:[]}
}));

