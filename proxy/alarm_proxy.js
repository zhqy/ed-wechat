// alarm proxy(redis)
// 2yuri

var config = require('../config');
var rediscfg = config.redisServer;
var redis = require('redis');
var _ = require('lodash');
var logger = require('../common/logger');

function createClient() {
    try {
        return redis.createClient(rediscfg.port, rediscfg.host);
    } catch (e) {
        return null;
    }
}
module.exports = {
	checkAlarmByBuilding : function(bid,callback){
        // 检查红色告警
        var checkAlarm = function(data){
            var ret = false;
            for(var i=0;i<data.length;i++){
                var wi = JSON.parse(data[i]);
                if(wi.rank == 'red'){
                    ret = true;
                    break;
                }
            }
            return ret;
        };
		try{
			var client = createClient();
			client.keys(bid + '_*',function(err,reply){
				if (err) {
					client.end();
					return callback(err);
				}
				console.log(reply);
				// reply can be []; then call mget will crash
				// if(typeof reply == 'string'){reply = [reply];}
				if(reply.length >= 1){
					client.mget(reply,function(err,data){
						logger.debug(reply);
						if (err) {
						client.end();
						return callback(err);
						}
						client.end();
						callback(null,checkAlarm(data));
					});
				}else{
					client.end();
					callback(null,false);
				}
			});
		}catch(e){
			callback && callback(e);
		}
	}
}