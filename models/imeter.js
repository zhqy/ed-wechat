var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

mongoose.model('IMeter', new Schema({
    Id: { type: ObjectId },
    Name: { type: String },
    BuildingInfomationId: { type: ObjectId },
    Address: { type: String },
    //CustomNO: { type: String },
    ChannelNO: { type: Number },
    Description: { type: String },
    EnterpriseId: { type: ObjectId },
    IRTUInfomationId: { type: ObjectId },
    ThresholdValue: {
        dlrl: { type: Number, default: -100 },
        sydl: { type: Number, default: -100 },
        yggl: { type: Number, default: -100 },
        dy: {
            h: { type: Number, default: -100 },
            l: { type: Number, default: -100 }
        },
        glys: { type: Number, default: -100 }
    },
    EnergyType: { type: String },
    EnergySubType: { type: String, default: '0000' }, //能耗子分项
    IMeterTrunkInformationId: { type: ObjectId },
    SubType: { type: String },//所属分项的类型，1:A 2:B 3:C
    CreateDateTime: { type: Date, default: Date.now },
    MeterType: { type: Number, default:'0' },//0 正常，1 总表，2 虚拟插座表 3 是上级总表(3类型只需要记录数据，不做任何计算)
    CommunicateProtocol:{type:Number,default:'0'}//通信协议：000- IO bus，001-MOD BUS，010-CJT188，011-DL645
})); 

mongoose.model('IMeterDayLog', new Schema({
    IMeterId: { type: ObjectId },
    BuildingInformationId: { type: ObjectId },
    EnterpriseId: { type: ObjectId },
    EnergySubType: { type: String, default: '0000' },
    SubType: { type: String },
    Year: { type: Number },
    Month: { type: Number },
    Day: { type: Number },
    Date: { type: Date },//新增日期字段有利于数据获取
    Message: {
        sydl: {//剩余电流 每天最大值
            v: { type: Number },
            t: { type: Date } //最大对应时间
        },
        avgsydl: { type: Number }, // 剩余电流平均值
        avgsydlcount: { type: Number },
        dycount: { type: Number },
        glyscount: { type: Number },
        sydlvaluecount: { type: Number },
        dyvaluecount: [],
        glysvaluescount: [],
        dymax: [],
        dymin: [],
        dlmax: [],
        dl: [],
        dlcount: { type: Number },
        dlvaluecount: [],
        glysmin: [],
        //zdxl:{type:Number},
        //zdxlmax:{type:Number},
        dy: [
            /*{
                x:{type:String}, // 所属项
                v:{type:Number}  // 值
            }*/
        ],
        glys: [],            // 功率因数平均值，每天电流>0.02a平均
        yggl: [{             // 有功功率
            v: { type: Number },
            t: { type: Date } //最大对应时间
        }] // 每个Imeter 当天最大值 存储对应的时间
    },
    CreateDateTime: { type: Date, default: new Date() }
}));

// 每个上报节点imeter数据日志
mongoose.model('IMeterDataLog', new Schema({
    IMeterId: { type: ObjectId },
    BuildingInformationId: { type: ObjectId },
    EnterpriseId: { type: ObjectId },
    EnergySubType: { type: String },
    SubType: { type: String },
    Message: {
        zgl: { type: Number },
        wggl: { type: Number },
        dl: [],//剩余电流平均
        dy: [],//电压平均
        glys: [],//功率因素
        yggl: [],//有功功率
        sydl: { type: Number }//剩余电流
    },
    CreateDateTime: { type: Date }
}));