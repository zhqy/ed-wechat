// api controller 
// 2yuri.

var config = require('../config');
var o_isdc = require('../proxy/meter_proxy').o_isdc;
var o_imeter = require('../proxy/meter_proxy').o_imeter;
var o_energy = require('../proxy/energy_proxy');
var o_building = require('../proxy/building_proxy');
var o_user = require('../proxy/user_proxy');
var Eventproxy = require('eventproxy');
var _ = require('lodash');
var logger = require('../common/logger');
var moment = require('moment');

var energyrankview = '<li>'
            + '<div class="txtLeft">'
            +    '<h2><%= imeter.Name %></h2>'
            + '</div>'
            + '<div class="txtRight">'
            +    '<span><%= energydata %> kWh</span>'
            +    '<div class="precentbar">'
            +        '<div class="precent" style="width:<%= parseFloat((energydata/max).toFixed(4))*100 %>%"></div>'
            +    '</div>'
            + '</div>'
        + '</li>';

var _compleforenergyrankview = _.template(energyrankview);

exports.getenergydata = function(req,res,next){
	var id = req.query.id;
	o_isdc.getListByBuildingId(id,function(err,isdcs){
		if (err) {
			return next(err);
		}
		if (isdcs.length == 0) {
			return res.json({state : false, message : '没有ISDC电表'});
		}
		var isdc_address = [];
		var j =  0;
		for(; j < isdcs.length ; j++){
			isdc_address.push(isdcs[j].Address);
		}
		var endtime = new Date();
		var period =  config.energy_trend_period || 24;
		logger.debug(period);
		var begtime = new Date(endtime - period * 60 * 60 * 1000);

		o_energy.getEnergyByBuildingAndDate(isdc_address,begtime,endtime,function(err,statistic){
			if (err) {
				return next(err);
			}
			return res.json({state : true, data : statistic , pace : config.energy_trend_pace || 1});
		})
	});
};

exports.alarmwebsocketconfig = function(req,res,next){
	res.json(config.alarmwebsocket);
};

exports.getimeterenergydata = function(req,res,next){
	var	starttime = req.query.starttime,
		endtime = req.query.endtime;
	var buidingId = req.query.buildingid;
    logger.debug('..in get imeter energy data');
    logger.debug(starttime,endtime,buidingId);
	var ep = new Eventproxy();
	ep.on('state_flase',function(){
		return res.json({state : false, data : null});
	});
	if (buidingId) {
		o_imeter.getImetersByBuildingId(buidingId,function(err,imeters){
			if (err) {
				return next(err);
			}
			//logger.debug(imeters);  // debug
			if (imeters) {
				if (imeters.length > 0) {
					ep.after('imeter_data',imeters.length,function(imetersdata){
						imetersdata = _.sortByOrder(imetersdata,'energydata','desc');
						var data = '';
						var max = {max : imetersdata[0].energydata};
                        logger.debug('max: ',max);
						_.each(imetersdata,function(_imeterdata){
                            logger.debug(_imeterdata);
							data += _compleforenergyrankview(_.assign(_imeterdata,max));
						})
						return res.json({state : true, data : data});
					});
					_.each(imeters,function(imeter){
						(function(_imeter){
							o_energy.getEnergyDataByImeterAndData(_imeter["_id"],starttime,endtime,function(err,imeterdata){
							if (err) {
								return next(err);
							}
                            console.log(imeterdata);
							return ep.emit('imeter_data',{imeter: _imeter , energydata : parseFloat(imeterdata.toFixed(2))});
						});
						})(imeter);
					})
				}else{
					return ep.emit('state_flase');
				}
			}else{
				ep.emit('state_flase');
			}
		})
	}else{
		res.json({state : false, data : null});
	}
};

//
//保存管理建筑
//
exports.managebuildings = function(req,res,next){
	var data = req.body.data;
	var sdata = JSON.parse(data);
	var buildings = sdata.currentBuildings;
	var wxid = sdata.wxid;
	var xtid = sdata.xtid;

	logger.debug('current builds : ',buildings);
	if (wxid) {
		o_user.o_wechat.getUserByOpenid(wxid,function(err,ret){
			if (!err && ret) {
                //修改 11.20
                buildings = buildings || [];
                var extra = _.filter(ret.ManageBuildings,function(n){
                   return n.user != xtid; 
                });
                _.each(buildings,function(b){
                   extra.push({building : b,user :xtid});
                });
                ret.ManageBuildings = extra;
				ret.save(function(err,result){
					if (!err) {
						return res.json({error : 0, result : {data : 'success'}});
					}
					res.json({error : -1,result : {data : 'database operation fails'}});
				});
			}else{
				res.json({error : -1 , result: {data : 'database opration fails'}});
			}
		})
	}else{
		logger.error('wechat id is null');
		res.json({error : -1 , result : {data: 'wechat id is null'}});
	}
};

//
//退出登陆
//
exports.logout = function(req,res,next){
	var wxid = req.query.wxid;
	if (wxid) {
		o_user.o_wechat.getUserByOpenid(wxid,function(err,ret){
			if (!err && ret) {
				ret.SystemUserId = null;
				ret.save(function(err,result){
					if (!err) {
						return res.json({error : 0, result : {data : 'success'}});
					}
					res.json({error : -1,result : {data : 'database operation fails'}});
				})
			}else{
				res.json({error : -1 , result: {data : 'database opration fails'}});
			}
		})
	}else{
		logger.error('Wechat id is null');
		res.json({error : -1 , result : {data: 'Wechat id is null'}});
	}
};

//
//历史能耗数据
//
exports.gethistoryenergydata = function(req,res,next){
    var bid = req.query.buildingid,
        time = req.query.time,
        type = req.query.type;
    //
    var yearXaxis = function(n){
        return time + '年 ' + n + '月';
    };
    var mongthXaxis = function(y,m,d){
        var date = moment(y + '/' + m + '/' + d);
        var w = date.weekday();
        var ws;
        switch(w){
            case 1 :{
                ws = '星期一';
                break;
            }
            case 2 :{
                ws = '星期二';
                break;
            }
            case 3 :{
                ws = '星期三';
                break;
            }
            case 4 :{
                ws = '星期四';
                break;
            }
            case 5 :{
                ws = '星期五';
                break;
            }
            case 6 :{
                ws = '星期六';
                break;
            }
            case 7 :{
                ws = '星期日';
                break;
            }
            default:{}
        }
        return y + '年' +  m + '月' + d + '日 ' + ws;
    }
    var ep = new Eventproxy();
    ep.fail(function(){
       return res.json({state : false,data :null});
    });
    if(bid){
        var n = 1;
        if(type == 'Year'){
            ep.after('month_data',12,function(mds){
                var y = _.pluck(_.sortBy(mds, 'index'), 'data');
                var x = [ yearXaxis(1),yearXaxis(2),yearXaxis(3),yearXaxis(4),yearXaxis(5),
                yearXaxis(6),yearXaxis(7),yearXaxis(8),yearXaxis(9),yearXaxis(10),yearXaxis(11),yearXaxis(12)];
                
                return res.json({state : true, data : {x :x,y : y}});
            });
            var ms = moment().year(time).startOf('year');
            var me = moment(ms).endOf('month');
            while(n <= 12){
                (function(i){
                    o_energy.getEnergyDataByBuildingAndDate(bid,new Date(ms.format()),new Date(me.format()),function(err,data){
                        if(err){return ep.emit('error');}
                        ep.emit('month_data',{index : i,data : parseFloat(data.toFixed(2))});
                    });                    
                })(n);
                ms = moment(ms).add(1,'months');
                me = moment(me).add(1,'months');
                n++;
            }
        }else if(type == 'Month'){
            var year = time.split('-')[0];
            var month = time.split('-')[1];
            var ds = moment().year(year).month(month - 1).startOf('month');
            var de = moment(ds).endOf('day');
            var tt = moment(ds).endOf('month').date();
            ep.after('day_data',tt,function(dds){
                var y = _.pluck(_.sortBy(dds, 'index'), 'data');
                var x = [];
                var i = 1;
                while(i<=tt){
                    x.push(mongthXaxis(year,month,i));
                    i ++;
                }
                return res.json({state : true,data : {x : x,y : y}});
            })
            while(n <= tt){
                (function(i){
                    o_energy.getEnergyDataByBuildingAndDate(bid,new Date(ds.format()),new Date(de.format()),function(err,data){
                        if(err){return ep.emit('error');}
                        console.log(data);
                        ep.emit('day_data',{index : i,data : parseFloat(data.toFixed(2))});
                    });
                })(n)
                ds = moment(ds).add(1,'days');
                de = moment(de).add(1,'days');
                n++;                
            }
        }else if(type == 'Week'){
            var ds = moment(time);
            var de = moment(ds).endOf('day');
            ep.after('day_data',7,function(dds){
                var y = _.pluck(_.sortBy(dds, 'index'), 'data');                
                var x = ['星期一','星期二','星期三','星期四','星期五','星期六','星期日'];
                return res.json({state : false, data : {x : x, y : y}});
            });
            while(n <= 7){
                (function(i){
                    o_energy.getEnergyDataByBuildingAndDate(bid,new Date(ds.format()),new Date(de.format()),function(err,data){
                        if(err){return ep.emit('error');}
                        console.log(data);
                        ep.emit('day_data',{index : i,data : parseFloat(data.toFixed(2))});
                    });
                })(n)
                ds = moment(ds).add(1,'days');
                de = moment(de).add(1,'days');
                n++;                
            }
        }else{
            return res.json({state : false, data : null});
        }
    }
}

//
// 获取imeterdatalogs
//
exports.getimeterdatalogs = function(req,res,next){
    var iid = req.query.iid,
        time = req.query.datetime,
        // 可选参数（时间区间）
        period = req.query.period;
    time = moment(time);
    if(iid && time){
        var begtime = moment(time).subtract(period ? parseInt(period):30,'m');
        var endtime = moment(time).add(30,'m');
        
        o_imeter.getImetersDataLogsByIdAndTime(iid,new Date(begtime.format()),new Date(endtime.format()),function(err,data){
            if(!err && data){
                res.json({state:true,data:data});
            }else{
                return res.json({state:false,data:null});
            }
        })
    }else{
        return res.json({state : false,data : null});
    }  
}




























