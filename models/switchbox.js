
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

mongoose.model('SwitchBox', new Schema({
    Name:{type:String},
    BuildingInformationId: { type: ObjectId },
    Floor:{type:Number},
    EnterpriseId:{type:ObjectId},
    SwitchBoxNo: { type: String },
    Address: { type: String },
    RatedCurrentIn: { type: String },//进线额定电流
    TypeIn: { type: String },//进线类型 三相(3P)、两相(2P)、单相(1P)
    IRTUList: [],
       /* {
            IRTUId: { type: ObjectId },
            Name: { type: String },
            CustomNO: { type: String }
        }
    ],*/
    LoopTankList: [//回路列表
      {
          LoopTankNo: { type: String },//回路编号
          RatedCurrent: { type: String },//进线额定电流
          Type: { type: String },//子回路断通路器类型：三相(3P)、两相(2P)、单相(1P)［单向选择A、B、C 具体哪个项］
          LeakRatedCurrent: { type: String },//漏电保护器额定漏电电流
          HasLeakCurrent: { type: Boolean },//是否安装有漏电保护器
          LoadDirection: { type: String },//负荷说明
          EquipmentVolume: { type: String },//设备容量
          IMeter: {type:ObjectId},
          OffChannelDeviceType:{type:String,default:'1P'},
          // 一个回路对应一个IMeter
         /* {
              IMeterId: { type: ObjectId },
              Name: { type: String },
              CustomNO: { type: String },
              ChannelNO: { type: String }
          }*/
        Controlinformation : {
            ControlIRTUid : {type : ObjectId},
            ControlNo : {type : Number},
            ControlName : {type : String}
          }
      }
    ]
}));
