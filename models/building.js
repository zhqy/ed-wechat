/**
  * 系统数据库 - 建筑
  */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

mongoose.model('BuildingInfo', new Schema({
    Id: { type: ObjectId },
    EnterpriseId: { type: ObjectId },
    BuildingTypeId: { type: String },
    Name: { type: String },
    Province: { type: String },
    City: { type: String },
    CityNo: { type: String },
    Address: { type: String },
    BuildingDate: { type: String },
    Features: { type: String },
    Floor: { type: Number },
    Areas: { type: Number },
    EnergyThresholdValue:{type:Number}, // 能耗阀值
    EnergyPrice:[                       // 电能阶段价格
        /*{
         StartTime:'',
         EndTime:'',
         Price:0
         }*/
    ],
    WorkTime:{
        Day:{type:Number,default:31},
        Time:[
            /*{
            * Name:'',
            * Start:'',
            * End:''
            * }
            * */
        ]
    },
    PictureURL: [{
        Path: { type: String },
        Des: { type: String }
    }],
    AirConditionAreas: { type: Number },
    HeatingAreas: { type: Number },
    AirType: { type: String },
    Structure: { type: String },
    ExteriorMaterials: { type: String },//外表材料
    HeatingType: { type: String },
    WindowType: { type: String },
    GlassType: { type: String },
    WindowMaterialType: { type: String },
    CreateDate: { type: Date },
    StartMonitorDateTime: { type: String },
    ExtendInformation: {
        HumanNumber: { type: Number, default: 0 },    // 办公人数 日均客流 参观人数/学生人数 就诊人数
        WorkTime: {                              // 运营时间
            Start: { type: String, default: '9:00' },
            End: { type: String, default: '18:00' }
        },
        StarsType: { type: String, default: 'A' },    // 星级 医院等级
        Occupancy: { type: Number, default: 0.0 },    // 入住率 客流量或上座率（体育建筑）
        Beds: { type: Number, default: 0 },           // 床位数
        HospitalType: { type: String, default: 'A' }  // 医院类型
    } // 扩展信息
}
));