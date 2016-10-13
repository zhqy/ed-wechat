// meter proxy
// 2yuri.


var models = require('../models');
var ISDC = models.ISDC;
var IMETER =  models.IMeter;
var SwitchBox = models.SwitchBox;
var IMeterDataLog = models.IMeterDataLog;
var IRTU = models.IRTU;

var logger = require('../common/logger');
var ObjectId = require('mongoose').Types.ObjectId;

var cons = function(sb,imeter){
    return {
        id : sb['_id'],
        iid : imeter,
        address : sb['Address'],
        floor : sb['Floor']
    };
};

var o_isdc = {
	getListByBuildingId : function(id,callback){
        logger.debug(id);
		ISDC.find({BuildingInfomationId : id}).sort({ 'Address': 'asc' }).exec(callback);
	},
       getIsdcById : function(id,callback){
    console.log('>>> in get isdc');
    ISDC.findById(id,callback);
  }
};

/**
 * irtu relate funcs
 */
var o_irtu = {
  getIrtuById : function(id,callback){
    console.log('>>> in get irtu');
    IRTU.findById(id,callback);
  }
};

var o_imeter =  {
	getImetersByBuildingId : function(id,callback){
		IMETER.find({BuildingInfomationId : id}).exec(callback);
	},
    // 11.25 imeter data logs
    getImetersDataLogsByIdAndTime : function(id,begtime,endtime,callback){
        console.log(id);
        console.log(begtime,endtime);
        IMeterDataLog.find({IMeterId : id, CreateDateTime : {$gte : begtime, $lte : endtime}},'SubType Message CreateDateTime').exec(function(err,ret){
            if(!err){
                if(ret){
                    console.log(ret.length);
                    var result = [];
                    for(var n = 0; n < ret.length; n++){
                        console.log(ret[n]);
                        result.push({type : ret[n]['SubType'], time : ret[n]['CreateDateTime'],
                            dy : ret[n]['Message'].dy,
                            dl : ret[n]['Message'].dl,
                            glys : ret[n]['Message'].glys,
                            yggl : ret[n]['Message'].yggl,
                            sydl : ret[n]['Message'].sydl
                        })
                    }
                    return callback(null,result);
                }else{
                    return callback(null,[]);
                }                
            }
            return callback(err);
        })
    },
    
    getImeterById : function(id,callback){
        IMETER.findById(id,callback);
    }
};

var o_switchbox = {
          // **************************add by zhqy 2016.3.25;
  getControlCfgByIidAndSbid : function(iid,sbid,cb){
    SwitchBox.findById(sbid,function(err,ret){
      if(err) return cb(err);
      if(!ret.LoopTankList || ret.LoopTankList.length == 0){
        return cb(null,null);
      }
      for(var i=0; i<ret.LoopTankList.length; i++){
        if(ret.LoopTankList[i]['IMeter'].toString() == iid){
          var _cfg = ret.LoopTankList[i]['Controlinformation'];
          console.log('>>> _cfg');
          console.log(_cfg);

          o_irtu.getIrtuById(_cfg.ControlIRTUid,function(err,irtu){
            if(err) return cb(err);
            if(!irtu) return cb(null,null);
            o_isdc.getIsdcById(irtu.ISDCInfomationId,function(err,isdc){
              if(err) return cb(err);
              return cb(null,{
                sid : isdc.Address,
                irtu : irtu.Address,
                cno: _cfg.ControlNo
              });
            });
          });
        }
      }
      // 未匹配到iid对应的回路
      return cb(null,null);
    });
  },
  // **************************add by zhqy 2016.3.25;
	getAllByBuildingId : function(id,callback){
        logger.debug(id);
		SwitchBox.find({ BuildingInformationId : ObjectId(id)},'Name Floor LoopTankList',function(err,data){
            logger.debug(data);
            callback(err,data);
        });
	},
    getInfoWithImeterByBuildingId :function(id,callback){
        
        SwitchBox.find({BuildingInformationId : ObjectId(id)},function(err,sbs){
            //console.log(sbs);
            if (!err) {
                var ret = [];
                var sbl = sbs.length;
                console.log(sbl);
                var ltl = 0; 
                while(sbl--){
                    var sb = sbs[sbl];
                    var sblt = sb['LoopTankList'];
                    ltl = sblt.length;
                    while(ltl--){
                        var lt = sblt[ltl];
                        if (lt['IMeter']) {
                            ret.push(cons(sb,lt['IMeter']));
                        }
                    }
                }
                callback(null,ret);
            }else{
                return callback(err);
            }
        });
    },
    getSwitchBoxById : function(id,callback){
        SwitchBox.findById(id,callback);
    }
}

exports.o_irtu = o_irtu;
exports.o_isdc = o_isdc;
exports.o_imeter = o_imeter;
exports.o_switchbox = o_switchbox;
