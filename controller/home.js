// home page
// 2yuri

var o_user = require('../proxy/user_proxy');
var o_alarm = require('../proxy/alarm_proxy');
var o_building = require('../proxy/building_proxy');
var o_meter = require('../proxy/meter_proxy');
var eventproxy = require('eventproxy');
var _ = require('lodash');
var redis = require('redis');
var rediscfg = require('../config').redisServer;
var logger = require('../common/logger');

//首页
exports.index = function(req, res, next) {
	var wxid = req.query.wxid;
	var xtid = req.query.xtid;

	var render = function(options) {
		var output = {
			title: '首页',
			wxid: wxid,
			xtid: xtid
		}
		if (options.no_building) {
			_.assign(output, {
				buildings: [],
				alarm: false
			});
		} else {
			_.assign(output, {
				buildings: options.data,
				alarm: options.alarm
			});
		}
		return res.render('index', output);
	};

	if (wxid) {
		o_user.o_wechat.getManageBuildingsByOpenid(wxid, xtid,function(err, buildings) {
			if (!err) {
				if (buildings && buildings.length >= 1) {
					var ep = eventproxy();
					var _flag = false;
					ep.after('check_done', buildings.length, function(states) {
						return render({
							alarm: _flag,
							data: buildings
						});
					});
					for (var j = 0; j < buildings.length; j++) {
						o_alarm.checkAlarmByBuilding(buildings[j]["_id"], function(err, state) {
							if (err) {
								return next(err)
							}
							_flag = state;
							ep.emit('check_done');
						});
					}
				} else {
					return render({
						no_building: true
					});
				}
			} else {
				return next(err);
			}
		});
	}
};

//
// 用户信息
//
exports.getuserprofile = function(req, res, next) {
	var wxid = req.query.wxid;
	var xtid = req.query.xtid;
	if (wxid) {
		o_user.o_wechat.getUserAllinfoByOpenid(wxid, function(err, user) {
            if(err){
                return next(err);
            }
            if(user){
                res.render('profile',{title : '用户信息', user : user, wxid : wxid, xtid : xtid});
            }else{
                res.render('notify/notify',{title : '提示', msg : '请重新登录'});
            }
		});
	}
};

//
// 管理建筑
//
exports.buildingmanage = function(req, res, next) {
	var wxid = req.query.wxid;
	var xtid = req.query.xtid;

	var checkNotIn = function(array, value) {
		var ret = true;
		// comnpare _id should toString();
		for (var j = 0; j < array.length; j++) {
			if (value._id.toString() == array[j]['_id'].toString()) {
				ret = false;
				break;
			}
		}
		return ret;
	};

	var ep = eventproxy();
	ep.all('user_manage_buildings', 'enterprise_buildings', function(ub, eb) {
		if (eb && eb.length >= 0) {
			var lb = eb.filter(function(value) {
				return checkNotIn(ub, value);
			});
		}
		return res.render('manage_building', {
			title: '建筑管理',
			ub: ub,
			lb: lb,
			wxid: wxid,
			xtid: xtid,
			scripts: ['zepto.min', 'pages/index/manage_building'], //js scripts.
			alarm: false // in building manage page set alarm default false.
		});
	});
	o_user.o_wechat.getManageBuildingsByOpenid(wxid,xtid, function(err, ret) {
		if (!err) {
			ep.emit('user_manage_buildings', ret);
		} else {
			return next(err);
		}
	});

	o_building.getBuildingsByUserId(xtid, function(err, ret) {
		if (!err) {
			ep.emit('enterprise_buildings', ret);
		} else {
			return next(err);
		}
	})

};

//
//告警信息
//
exports.getwarinings = function(req, res, next) {
	var wxid = req.query.wxid;
	var xtid = req.query.xtid;

	var rc = [];
	var render = function(cp) {
        //不要嘲笑我们js的逻辑，就是这么写
        control = cp ? true : false;
		res.render('allwarnings', { title: '告警信息', wxid: wxid, xtid: xtid, warnings: rc,control : cp,scripts : ['Chart']});
	};
    
    // 告警信息第一级别处理
	function ts(ws) {
		for (var n = 0; n < ws.length; n++) {
			ws[n] = JSON.parse(ws[n]);
			var type = ws[n]['type'];
			switch(type){
				case 2:{
					ws[n]['typename'] = '漏电监控';
					break;
				}
				case 8:{
					ws[n]['typename'] = '三相平衡度';
					break;
				}
				case 0:{
					ws[n]['typename'] = '过载监控';
					break;
				}
				case 6:{
					ws[n]['typename'] = '用电效率';
					break;
				}
				case 1:
				case 4:
				case 5:{
					ws[n]['typename'] = '线损监控';
					break;
				}
				case 7:{
					ws[n]['typename'] = '能耗预警';
					break;
				}
				default:{}
			}
		}
		ws = _.sortByOrder(ws, 'datetime', 'desc');
		var g = _.groupBy(ws, function(w) {
			return w.rank;
		});
		//set default 5.
		var ret = [];
		g.red && ret.push(g.red); //只选红色
		//g.yellow && ret.push(g.yellow);

		return (_.flatten(ret)).slice(0, 5);
	};
    
    // 告警信息第二级处理
    function wrapper(ws,data){
        console.log(ws);
        console.log(data);
      ws = ws || [];
      for(var i = 0; i < ws.length; i++){
          var o = ws[i];
          var iid = o.iid;
          for(var n = 0; n < data.length; n++){

			if (data[n]['iid'] == iid) {
				o.switchbox = data[n]['id'];
				o.address = data[n]['address'];
				o.floor = data[n]['floor'];
				break;
			}
		}
      }  
    };
    
	if (wxid) {
		var ep = eventproxy();
		o_user.o_wechat.getManageBuildingsByOpenid(wxid,xtid, function(err, bs) {
			if (!err && bs) {
				if (bs.length > 0) {
					ep.after('bd', bs.length, function() {
						redisclient.end(); // redis connection close.
                        // 获取控制权限（可并行）
                        o_user.o_wechat.checkControlPermission(wxid,function(err,cp){
                            if (err) {
                                return next(err);
                            }
                            return render(cp);                            
                        })
					});
					var redisclient = redis.createClient(rediscfg.port, rediscfg.host);
					for (var n = 0; n < bs.length; n++) {
						(function(k) {
							//*********** mod by zhqy 2016.3.25
							 var _ep = new eventproxy();                           
 //每个建筑取imeter信息 11.25
                            o_meter.o_switchbox.getInfoWithImeterByBuildingId(bs[k]['_id'],function(err,data){
                                if(!err && data){
                                // 取告警信息
                                    redisclient.keys(bs[k]['_id'] + '_*', function(err, ret) {
                                        // ret长度必须大于1，防止redis crash
                                        if (!err && ret && ret.length > 0) {
                                            redisclient.mget(ret, function(err, ws) {
                                                if (!err) {
                                                    logger.debug(ws);
                                                    var w = {};
                                                    w.ws = ts(ws);
                                                    // 告警信息再封装
                                                    wrapper(w.ws,data);
                                                   // w.bid = bs[k]['_id'];
                                                    //w.bname = bs[k]['Name'];
                                                    // debug
                                                    //console.log(w.ws);
                                                    //rc.push(w);
																										//*********** mod by zhqy 2016.3.25
                                                    w.bid = bs[k]['_id'];
                                                    w.bname = bs[k]['Name'];
																										if(w.ws.length == 0){
                                                    	rc.push(w);
																											ep.emit('bd');
																										}else{
																											_ep.after('_get_config',w.ws.length,function(){
																												rc.push(w);
																												ep.emit('bd');
																											});
																											w.ws.forEach(function(wo){
																												o_meter.o_switchbox.getControlCfgByIidAndSbid(wo.iid,wo.switchbox,function(err,ret){
																		                      if(err) return next(err);
																		                      wo._statusDescription = '断开回路';
																		                      if(ret){
																		                        wo._cfg = ret;
																		                        wo._status = 1;
																		                      }else{
																		                        wo._status = -1;
																		                      }
																		                      _ep.emit('_get_config');
																		                    });
																											});
																										}
                                                }else{
						  ep.emit('bd');
						}
                                                //ep.emit('bd');
                                            });
                                        } else {
                                            ep.emit('bd');
                                        }
                                    });
                                 // 取告警信息
                                }else{ep.emit('bd')}
                            })
						})(n);
					}
				} else {
					return render();
				}
			};
		});
	}
};
