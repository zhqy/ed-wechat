// building index.
// 2yuri.

var o_building = require('../proxy/building_proxy');
var o_meter = require('../proxy/meter_proxy');
var o_alarm = require('../proxy/alarm_proxy');
var o_energy = require('../proxy/energy_proxy');
var o_user = require('../proxy/user_proxy');
var redis = require('redis');
var rediscfg = require('../config').redisServer;
var eventproxy = require('eventproxy');
var _ = require('lodash');
var logger = require('../common/logger');
var moment = require('moment');

// 建筑首页
exports.index = function(req,res,next){
    var id = req.params.id;
    var wxid = req.query.wxid;
    var xtid = req.query.xtid;

    var ep = new eventproxy();
    ep.fail(next);
    ep.all('building','alarm','lastweekenergy','lastweekenergy_cf','thismonthenergy','thismonthenergy_cf',function(b,f,lwe,lwe_cf,tme,tme_cf){
        logger.debug(lwe,lwe_cf,tme,tme_cf);
        var wcf = parseFloat((lwe / lwe_cf).toFixed(2));
        var mcf = parseFloat((tme / tme_cf).toFixed(2));
        logger.info(wcf);
        logger.info(mcf);
        res.render('building/index',{title : '建筑详情', building : b, wxid :wxid, xtid : xtid, warnings : f,
            lwe : lwe.toFixed(2), lwe_cf : lwe_cf.toFixed(2), wcf : wcf,
            tme : tme.toFixed(2), tme_cf : tme_cf.toFixed(2), mcf : mcf,
            scripts : ['highcharts', 'moment.min','pages/building/index']
        });
    });
	if (id) {
       o_building.getBuildingById(id,ep.done('building'));
       o_alarm.checkAlarmByBuilding(id,ep.done('alarm'));
       //
       var lwbt = moment().startOf('week').subtract(7,'days');
       var lwet = moment().endOf('week').subtract(7,'days');
       // 12.02 往前第四周的数据
       var cfmwbt = moment().startOf('week').subtract(7,'days').subtract(28,'days');
       var cfmwet = moment().endOf('week').subtract(7,'days').subtract(28,'days');
       var tmfd = moment().startOf('month');
       var tmed = moment().endOf('month');
       var cfymfd = moment().startOf('month').subtract(1,'years');
       var cfymed = moment().endOf('month').subtract(1,'years');
       //
       o_energy.getEnergyDataByBuildingAndDate(id,new Date(lwbt.format()), new Date(lwet.format()),ep.done('lastweekenergy'));
       o_energy.getEnergyDataByBuildingAndDate(id,new Date(cfmwbt.format()), new Date(cfmwet.format()),ep.done('lastweekenergy_cf'));
       o_energy.getEnergyDataByBuildingAndDate(id,new Date(tmfd.format()), new Date(tmed.format()),ep.done('thismonthenergy'));
       o_energy.getEnergyDataByBuildingAndDate(id,new Date(cfymfd.format()), new Date(cfymed.format()),ep.done('thismonthenergy_cf'));
	}
};
//
// 能耗排行
//
exports.energyConsumption = function(req,res,next){
	var id = req.params.id,
		wxid = req.query.wxid,
		xtid = req.query.xtid;
    //往前推3年
    //周
    function getLastWeek(t){
        var s =  t.subtract(1,'weeks');
        var ss = moment(s); //clone
        var e = s.endOf('week');
        var ff = ss.format('M-D') +'~'+ e.format('M-D');
        return {s : ss, e: e, ff : ff};
    };
    var wtl = [];
    var wti = { year : null, weeks : []};
    var wf = true;
    var c = 0;
    var lw = {};
    var tfdofw = moment().startOf('week');
    // console.log(tfdofw.format('M/D'));
    var tfdofy = moment().startOf('year');
    while(wf){
        lw = lw.s? getLastWeek(lw.s) : getLastWeek(tfdofw);
        if(lw.s.isAfter(tfdofy)){
            wti.weeks.push(lw.ff);
        }else{
            wti.year = tfdofy.year();
            wtl.push(wti);
            wti = {year : null, weeks :[]};
            c ++;
            tfdofy = tfdofy.subtract(1,'years');
        }
        c == 3 && (wf = false);
    }
    //月
    var mtl = [];
    var dfm = ['1','2','3','4','5','6','7','8','9','10','11','12'];
    var tym = [];
    var ty = moment().year();
    var tm = moment().month() + 1;
    while(tm--){
        tym.push((tm + 1).toString());
    }
    mtl.push({year : ty, months : tym});
    mtl.push({year : ty -1, months : dfm});
    mtl.push({year : ty -2, months : dfm});

	res.render('building/energyconsumption',{ title : '能耗排行', buildingid : id, wxid : wxid, xtid : xtid,
        wtl : wtl , mtl : mtl,
        css : ['mobiscroll.custom-2.17.0.min'],
		scripts : ['mobiscroll.custom-2.17.0.min','moment.min','pages/building/energyconsumption' ]
	});
};

//
// 回路控制
//
exports.getswitchbox = function(req,res,next){
	var id = req.params.id,
		wxid = req.query.wxid,
		xtid = req.query.xtid;
	o_meter.o_switchbox.getAllByBuildingId(id,function(err,sbs){
        // 获取所有的配电箱和楼层
		if (err) {return next(err);}
		var floors = [];
		sbs.forEach(function(sb){
			floors.push(sb['Floor']);
		});
		floors = _.unique(floors);

        //获取建筑的所有告警
        var IsInWarnings = function(id,ws){
            var ret;
            for(var i = 0; i < ws.length; i++){
                if(ws[i].iid == id){
                    ret = true;
                    break;
                }
            }
            return ret;
        };
        var redisclient = redis.createClient(rediscfg.port, rediscfg.host);
        console.log(id);
        redisclient.keys(id + '_*',function(err,reply){
            if (!err) {
                console.log(reply);
                // 有告警的情况
                if(reply.length > 0){
                redisclient.mget(reply,function(err,ret){
                    if (!err) {
                        var ws = [];
                        ret.forEach(function(w){
                            var wi = JSON.parse(w);
                            ws.push(wi);
                        });
                    }else{
                        redisclient.end();
                        return next(err);
                    }
                    //遍历配电箱回路判断是否异常
                    for(var i= 0; i< sbs.length ; i++){
                        var state = false;
                        var tempLooptanks = sbs[i].LoopTankList;
                        if(tempLooptanks && tempLooptanks.length > 0){
                            for(var j=0;j<tempLooptanks.length;j++){
                                var imeterid = tempLooptanks[j].IMeter;
                                if(IsInWarnings(imeterid,ws)){
                                    state = true;
                                    break;
                                }
                            }
                        }
                        //增加一个状态说明
                        sbs[i].state = state;
                    }
                });
                }
                //返回
                res.render('building/switchbox',{ title : '回路控制', switchbox : sbs, floors : floors, wxid : wxid, xtid : xtid});
            }else{
                redisclient.end();
                next(err);
            }
        });
	});
};

//
// 历史能耗
//
exports.historyConsumption = function(req,res,next){
    var id = req.params.id;
    var xtid = req.query.xtid;
    var wxid = req.query.wxid;
    //往前推3年
    //周
    function getLastWeek(t){
        var s =  t.subtract(1,'weeks');
        var ss = moment(s); //clone
        var e = s.endOf('week');
        var ff = ss.format('M-D') +'~'+ e.format('M-D');
        return {s : ss, e: e, ff : ff};
    };
    var wtl = [];
    var wti = { year : null, weeks : []};
        //增加当前周
    var _tf = moment().startOf('week').format('M-D')+'~'+moment().endOf('week').format('M-D');
    wti.weeks.push(_tf);

     var wf = true;
    var c = 0;
    var lw = {};
    var tfdofw = moment().startOf('week');
    // console.log(tfdofw.format('M/D'));
    var tfdofy = moment().startOf('year');
    while(wf){
        lw = lw.s? getLastWeek(lw.s) : getLastWeek(tfdofw);
        if(lw.s.isAfter(tfdofy)){
            wti.weeks.push(lw.ff);
        }else{
            wti.year = tfdofy.year();
            wtl.push(wti);
            wti = {year : null, weeks :[]};
            c ++;
            tfdofy = tfdofy.subtract(1,'years');
        }
        c == 3 && (wf = false);
    }
    //月
    var mtl = [];
    var dfm = ['1','2','3','4','5','6','7','8','9','10','11','12'];
    var tym = [];
    var ty = moment().year();
    var tm = moment().month() + 1;
    while(tm--){
        tym.push((tm + 1).toString());
    }
    mtl.push({year : ty, months : tym});
    mtl.push({year : ty -1, months : dfm});
    mtl.push({year : ty -2, months : dfm});

    //年
    var ytl = [];
    ytl.push({year : ty});
    ytl.push({year : ty - 1});
    ytl.push({year : ty - 2});

    res.render('building/energyhistory',{ title : '历史能耗', buildingid : id, wxid : wxid, xtid : xtid,
        wtl : wtl , mtl : mtl, ytl : ytl,
        css : ['mobiscroll.custom-2.17.0.min'],
		scripts : ['mobiscroll.custom-2.17.0.min','moment.min','highcharts','pages/building/energyhistory' ]
	})
};

//
// 告警信息
//

exports.getalarms= function(req,res,next){
	var type = req.query.type;
	var bid = req.params.id;
	var wxid = req.query.wxid;
	var xtid = req.query.xtid;

	var getKeys = function (redis_client, sKey, callback) {
        redis_client.keys(sKey, function (err, reply) {
            callback && callback(err, reply);
        })
    };

	var wrapper = function(o,data){
        // console.log(data);
		var iid = o.iid;
        console.log(data.length);
		for(var n = 0; n < data.length; n++){
            console.log(data[n]['iid']); // debug
			if (data[n]['iid'] == iid) {
				o.switchbox = data[n]['id'];
				o.address = data[n]['address'];
				o.floor = data[n]['floor'];
				break;
			}
		}
        switch(o.type){
				case 2:{
					o['typename'] = '漏电监控';
					break;
				}
				case 8:{
					o['typename'] = '三相平衡度'; //电流
					break;
				}
				case 0:{
					o['typename'] = '过载监控';
					break;
				}
				case 6:{
					o['typename'] = '用电效率';
					break;
				}
				case 1:
				case 4:
				case 5:{
					o['typename'] = '线损监控';
					break;
				}
				case 7:{
					o['typename'] = '能耗预警';
					break;
				}
				default:{}
			}
		return o;
	}
    var ep = eventproxy();
	if (type) {
        ep.all('control_permission','alarm',function(cp,wd){
            return res.render('building/typealarm',{title : '告警详情', wxid : wxid,xtid : xtid,wd : wd,control: cp,
            scripts : ['Chart']
            });
        })
        o_user.o_wechat.checkControlPermission(wxid,function(err,cp){
            if (err) {
                return next(err);
            }
            console.log('permisson: ', cp); // debug
            ep.emit('control_permission',cp);
	   })
		o_meter.o_switchbox.getInfoWithImeterByBuildingId(bid,function(err,data){
			if (!err && data) {
				var redisclient = redis.createClient(rediscfg.port, rediscfg.host);
				var typelist = type.split('-');
				var len = typelist.length;
				if (typelist.length == 1) {
					redisclient.keys(bid + '_*_' + typelist,function(err,reply){
						if (!err) {
                            if(reply && reply.length > 0){
							redisclient.mget(reply,function(err,ws){
								if (!err) {
									// var wd = [];
									// ws.forEach(function(w){
									// 	var wo = JSON.parse(w);
									// 	wd.push(wrapper(wo,data));
                  //
									// });
                  //                   console.log(wd);// debug
                  //                   ep.emit('alarm',wd);
                  // ************ add by zhqy 2016.3.25
                  var wd = [];
                  if(ws.length == 0) return ep.emit('alarm',wd);
                  ep.after('_get_config',ws.length,function(){
                    console.log('>>>> in alarm got;');
                    console.log(wd);
                    return ep.emit('alarm',wd);
                  });
                  ws.forEach(function(w){
                    var wo = JSON.parse(w);
                    wrapper(wo,data);
                    o_meter.o_switchbox.getControlCfgByIidAndSbid(wo.iid,wo.switchbox,function(err,ret){
                      if(err) return next(err);
                      wo._statusDescription = '断开回路';
                      if(ret){
                        wo._cfg = ret;
                        wo._status = 1;
                      }else{
                        wo._status = -1;
                      }
                      wd.push(wo);
                      ep.emit('_get_config');
                    });
                  });

								}else{
									redisclient.end();
									next(err);
								}
							});
                            }else{
                                // 长度等于0
                            }
						}else{
							redisclient.end();
							next(err);
						}
					})
				}else{
					var ids = [];
					// 1-4-5 type
					getKeys(redisclient,bid + '_*_' + typelist[len--],function(err,ret){
						if (!err) {
							ids = ids.concat(ret);
							len --;
							if (len >= 0) {
								getKeys(redisclient,bid + '_*_' + typelist[len],arguments.callee);
							}else{
								redisclient.mget(ids,function(err,ws){
									var wd = [];

                  //**** mod by zhqy 2016.3.25
                  if(ws.length == 0) return ep.emit('alarm',wd);
                  ep.after('_get_config',ws.length,function(){
                    console.log('>>>> in alarm got;');
                    console.log(wd);
                    return ep.emit('alarm',wd);
                  });
                  ws.forEach(function(w){
                    var wo = JSON.parse(w);
                    wrapper(wo,data)
                    o_meter.o_switchbox.getControlCfgByIidAndSbid(wo.iid,wo.switchbox,function(err,ret){
                      if(err) return next(err);
                      wo._statusDescription = '断开回路';
                      if(ret){
                        wo._cfg = ret;
                        wo._status = 1;
                      }else{
                        wo._status = -1;
                      }
                      wd.push(wo);
                      ep.emit('_get_config');
                    });
                  });
                 // **** mod by zhqy 2016.3.25

									// ws.forEach(function(w){
									// 	var wo = JSON.parse(w);
									// 	wd.push(wrapper(wo,data));
                  //
									// });
                  // ep.emit('alarm',wd);

								})
							}
						};
					})
				}
			};
		})
	}else{
        //12.02增加，只显示红色告警信息
		ep.all('b','alarm','control_permission',function(bname,wd,cp){
            console.log(wd);
			res.render('building/allalarm',{title :'建筑内告警', wxid : wxid, xtid : xtid,control:cp,
				bname : bname,
				wd : wd,
                scripts : ['Chart']

			})
		});
        // user loop control permisson
        o_user.o_wechat.checkControlPermission(wxid,function(err,cp){
		if (err) {
			return next(err);
		}
		console.log('permisson: ', cp); // debug
		ep.emit('control_permission',cp);
	   })
		// b
		o_building.getBuildingById(bid,function(err,b){
			if (!err && b) {
				ep.emit('b',b.Name);
			}else{next(err)};
		})
		//alarm
		o_meter.o_switchbox.getInfoWithImeterByBuildingId(bid,function(err,data){
            console.log(data);
			if (!err && data) {
				try{
					var redisclient = redis.createClient(rediscfg.port, rediscfg.host);
					redisclient.keys(bid + '_*',function(err,reply){
						if (!err) {
                            if(reply && reply.length > 0){
							redisclient.mget(reply,function(err,ws){
								if (!err) {
									var wd = [];
									// ret.forEach(function(w){
									// 	var wo = JSON.parse(w);
                  //                       //只有红色
                  //                       if(wo.rank == 'red'){
									// 	  wd.push(wrapper(wo,data));
                  //                       }
                  //
									// });
									// ep.emit('alarm',wd);

                  //**** mod by zhqy 2016.3.25
                  if(ws.length == 0) return ep.emit('alarm',wd);
                  ep.after('_get_config',ws.length,function(){
                    console.log('>>>> in alarm got;');
                    console.log(wd);
                    return ep.emit('alarm',wd);
                  });
                  ws.forEach(function(w){
                    var wo = JSON.parse(w);
                    if(wo.rank != 'red'){
                      ep.emit('_get_config');
                      return;
                    };
                    wrapper(wo,data)
                    o_meter.o_switchbox.getControlCfgByIidAndSbid(wo.iid,wo.switchbox,function(err,ret){
                      if(err) return next(err);
                      wo._statusDescription = '断开回路';
                      if(ret){
                        wo._cfg = ret;
                        wo._status = 1;
                      }else{
                        wo._status = -1;
                      }
                      wd.push(wo);
                      ep.emit('_get_config');
                    });
                  });
                 // **** mod by zhqy 2016.3.25
								}else{
									redisclient.end();
									next(err);
								}
							});
                            }else{
                                //长度等于0
                                ep.emit('alarm',[]);
                                redisclient.end();
                            }
						}else{
							redisclient.end();
							next(err);
						}
					})
				}catch(e){
					return next(err);
				}

			}else{return next(err);}
		})
	}
};

