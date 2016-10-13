var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

mongoose.model('ISDC', new Schema({
    Id: { type: ObjectId },
    BuildingInfomationId: { type: ObjectId },
    Name: { type: String },
    Address: { type: String },
    CustomNO: { type: Number },
    Description: { type: String },
    EnterpriseId: { type: ObjectId },
    Configuration: {
        readsingleconf: { type: String },     // 单向抄表
        readconf: { type: String },            // 三相配置
        readinterval: { type: String },        // 抄表时间间隔
        reportinterval: { type: String },      // 上报间隔
        beatinterval: { type: String },        // 有线心跳间隔
        beatwifiinterval: { type: String },   // 无线心跳间隔
        timeouttime: { type: String },        // 数据接收超时
        reconnectinterval: { type: String },  // 重建连接间隔
        linktype: { type: String },           // 连接模式
        reserved: { type: String },  // 保留
        smscenttype: { type: String }, // 短信中心类型
        smscentno: { type: String },   // 短信中心号码
        simcardno: { type: String },   // SIM卡号码
        apn: { type: String },        // APN接入点名称
        id: { type: String },         // ID
        password: { type: String },    // Password
        gatewayip: { type: String },//data.toString('ascii',92,95),   // 网关ip
        subnetmask: { type: String }, // 子网掩码
        dnsip: { type: String },// dns
        ipaddress: { type: String }, // 本设备ip
        serverip: { type: String },  // 服务器ip
        factorport: { type: String },//data.slice(112,114),//data.readInt16BE(112), // 工程模式端口
        dataport: { type: String },//data.slice(114,116),//data.readInt16BE(114),  // 数据模式端口
        reserved2: { type: String },           // 保留
        loadingdatetime: { type: Date, default: Date.now },
        heatreportdate:{type:String,default:'0/0-0/0'}, // 热表热计量报表时间
        coldreportdate:{type:String,default:'0/0-0/0'} // 热表冷计量报表时间
    },
    //ThresholdValue: { type: String },//阀值
    RootIRTUConfig: { type: String, default: 0 }, // Root iRTU配置 0：无总表，1：总表仅提供三相电压，2：总表提供各相电压及电流数据
    RootIRTUSID: { type: String },              // Root iRTU SID 监测总表 Serial ID
    CreateDateTime: { type: Date, default: Date.now }
}));