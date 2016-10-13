// energy proxy

var models = require('../models');
var ISDCCyclesEnergy = models.ISDCCyclesEnergy;
var IMeterEnergyDailyStatistics = models.IMeterEnergyDailyStatistics;
var logger = require('../common/logger');

var o_energy =  {
	getEnergyByBuildingAndDate : function(address,begtime,endtime,callback){
        ISDCCyclesEnergy.find({ Address: { $in: address }, CreateDateTime: { '$gte': begtime, '$lte': endtime } }, 'Address CreateDateTime Values').sort({ 'CreateDateTime': 'asc' }).exec(callback);
		/*
        mongodb3.0
		var aggregation = [];
		aggregation.push({
			$match : {Address : {$in : address}, CreateDateTime : {$gte : begtime, $lte : endtime}}
		});
		aggregation.push({
			$project : {Address : 1, CreateDateTime : 1, _id : 0, Value : {$add : ["$Values.0","$Values.1","$Values.2","$Values.3"]}}
		});
		aggregation.push({
			$group : {_id : "CreateDateTime", energy : {$sum : "$Value"}}
		});
		aggregation.push({
			$sort : {CreateDateTime : 1}
		});
		ISDCCyclesEnergy.aggregate(aggregation).allowDiskUse(true).exec(callback);
        */
	},

	getEnergyDataByImeterAndData : function(imeterId,begtime,endtime,callback){
        logger.debug(imeterId,begtime,endtime);
		IMeterEnergyDailyStatistics.find({IMeterId : imeterId, CreateDateTime : {$gte : begtime,$lte : endtime}}, 'Value CreateDateTime')
		.sort('CreateDateTime').exec(function(err,docs){
            console.log(docs);//printf
			if (err) {callback(err)}
			if (docs) {
				var energydata = 0;
				var j = 0;
				for(; j < docs.length; j++){
					energydata += docs[j]["Value"];
				}
				callback(null,energydata);
			}
		})
	},
    
    getEnergyDataByBuildingAndDate : function(bid,begtime,endtime,callback){
        //logger
        logger.debug(begtime,endtime);
        IMeterEnergyDailyStatistics.find({BuildingInformationId : bid, CreateDateTime : {$gte : begtime, $lte : endtime}}, 'Value',function(err,values){
            if(!err){
                if(values && values.length > 0){
                    var total = 0;
                    for(var n = 0; n<values.length ; n++){
                        total += values[n]['Value'];
                    }
                    callback(null,total);
                }else{
                    callback(null,0)
                }
            }else{
               callback(err); 
            }
        })
    }
};

module.exports = o_energy;