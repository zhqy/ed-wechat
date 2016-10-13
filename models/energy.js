var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

mongoose.model('ISDCCyclesEnergy', new Schema({
    Address: { type: String }, // ISDC物理地址
    Values: [],  // 有功功率总值 数组， 0 是A 1 B 2 C 3 D
    TimeString: { type: String }, // 日期的yyyyMMdd
    CreateDateTime: { type: Date }
}));

mongoose.model('ISDCEnergyDailyStatistics', new Schema({
    ISDCId: { type: ObjectId },
    Address: { type: String }, // ISDC物理地址
    EnterpriseId: { type: ObjectId },
    BuildingInformationId: { type: ObjectId },
    Values: [],  // 有功功率总值 数组， 0 是A 1 B 2 C 3 D
    TimeString: { type: String }, // 日期的yyyyMMdd
    CreateDateTime: { type: Date }
}));

mongoose.model('IMeterCyclesEnergy', new Schema({
    IMeterId: { type: ObjectId },
    BuildingInformationId: { type: ObjectId }, // 以后对建筑下进行统计
    EnterpriseId: { type: ObjectId },
    EnergySubType: { type: String },
    IrtuCustomNo: { type: String },
    IsdcAddress: { type: String },
    SubType: { type: String },
    Value: { type: Number },
    CreateDateTime: { type: Date }
}));

mongoose.model('IMeterEnergyDailyStatistics', new Schema({
    IMeterId: { type: ObjectId , ref : 'IMeter'},
    BuildingInformationId: { type: ObjectId }, // 以后对建筑下进行统计
    EnterpriseId: { type: ObjectId },
    EnergySubType: { type: String },
    IrtuCustomNo: { type: String },
    IsdcAddress: { type: String },
    SubType: { type: String },
    Value: { type: Number },
    CreateDateTime: { type: Date }
}));