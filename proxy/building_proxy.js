/*
 *building proxy
 *created by 2yuri
 */

var Building = require('../models').Building;
var SystemUser = require('../models').SystemUser;

var o_building = {
	getBuildingById : function(id,callback){
		Building.findOne({_id : id}).exec(callback);
	},
	getBuildingsByUserId : function(userid,callback){
		if (userid) {
			SystemUser.findById(userid,function(err,user){
				if (err) {
					return callback(err);
				}
				Building.find({EnterpriseId : user.EnterpriseId}).exec(callback);
			})
		}
	}
};

module.exports = o_building;