// switch box & loop tank.
// 2yuri

var o_meter = require('../proxy/meter_proxy');
var o_user = require('../proxy/user_proxy');
var _ = require('lodash');
var eventproxy = require('eventproxy');
var logger = require('../common/logger');

//
// 首页
//
// exports.index = function(req,res,next){
// 	var switchboxid = req.params.id;
// 	var wxid = req.query.wxid,
// 		xtid = req.query.xtid;

// 	var ep = new eventproxy();
// 	ep.all('loops','cp',function(lr,cp){
// 		res.render('switchbox',{title : '配电箱', loopranklist : lr , switchboxid : switchboxid, wxid : wxid, xtid : xtid, control : cp,scripts : ['Chart']});
// 	});

// 	o_user.o_wechat.checkControlPermission(wxid,function(err,cp){
// 		if (err) {
// 			return next(err);
// 		}
// 		ep.emit('cp',cp);
// 	});

// 	o_meter.o_switchbox.getSwitchBoxById(switchboxid,function(err,switchbox){
// 		if (err) {return next(err)};
// 		if (switchbox) {
//             // 遍历回路获取电表名称
//             var loops = switchbox.LoopTankList;
//             ep.after('imetername',loops.length,function(){
// 			    ep.emit('loops',loops);
//             })
//             for(var i = 0; i < loops.length; i++){
//                 (function(k){
//                 var imeterid = loops[k].IMeter;
//                 o_meter.o_imeter.getImeterById(imeterid,function(err,imeter){
//                     if(err) return next(err);
//                     loops[k].ImeterName = imeter.Name || '无名称';
//                     ep.emit('imetername');
//                 });
//                 })(i);
//             }
// 		}else{
// 			return res.render('notify/notify',{msg : "数据错误"})
// 		}
// 	})
// };

// 新------------------------------------by 2yuri
/*
 * 详情
 */
var config = require('../config');
var loopcontrolhelper = require('../tools/loopcontrolhelper')({
  host : config.websocketServer.host,
  port: config.websocketServer.port
});
var Batch = require('batch');

exports.index = function(req,res){

  var id = req.params.id;
  var wxid = req.query.wxid;
  var xtid = req.query.xtid;

  var lines;
  var ep = new eventproxy();
  //
  ep.all('permission','names','statuses',function(permission){
    // console.log(lines);
    //debug
    // console.log(lines);
    res.render('switchbox',{
      title : '配电箱',
      loopranklist : lines,
      switchboxid : id,
      wxid : wxid,
      xtid : xtid,
      control : permission,
      scripts : ['Chart']
    });
  });

  o_user.o_wechat
  .checkControlPermission(wxid,function(err,rc){
    if (err) {
      return next(err);
    };
    ep.emit('permission',rc);
  });

  o_meter.o_switchbox.
  getSwitchBoxById(id,function(err,rc){
    if (err) {
      return next(err);
    };
    if (!rc) {
      return res.render('notify/notify',{
        msg : '数据错误'
      });
    }

    lines = rc.LoopTankList;
    //
    ep.after('name',lines.length,function(){
      ep.emit('names');
    });

    ep.after('status',lines.length,function(){
      ep.emit('statuses');
    });

    // request batch.

    var batch = new Batch();
    batch.concurrency(1);

    for(var x=0; x<lines.length; x++){
      (function(i){
        o_meter.o_imeter
        .getImeterById(lines[i].IMeter,function(err,imeter){
          if (err) {
            return next(err);
          };
          lines[i].ImeterName = imeter.Name;
          ep.emit('name');
        });
        //************ mod by zhqy 2016.3.25
        lines[i]['sbid'] = id;
        /**
         * request batch
         */

        // console.log(lines[i].Controlinformation);
        var ctrlcfg = lines[i].Controlinformation;
        if (ctrlcfg) {
          console.log('>>>> in controll information')
          var ctrlid = ctrlcfg.ControlIRTUid;
          var ctrlno = ctrlcfg.ControlNo;
          if (ctrlid && ctrlno) {
            console.log('>>>> in task');
            // task
            batch.push(function(done){
              console.log('>>>> exec task');
              o_meter.o_irtu.getIrtuById(ctrlid,function(err,irtu){
                console.log('>>> got irtu');
                if (err){ return next(err)};
                o_meter.o_isdc.getIsdcById(irtu.ISDCInfomationId,function(err,isdc){
                  console.log('>>> got isdc')
                  if(err){return next(err);}
                  var _itru_addr = irtu.Address;
                  console.log('>>> irtu_addr: '+ _itru_addr);
                  var _isdc_addr = isdc.Address;
                  var _req_data = {
                    sid : _isdc_addr,
                    payload : {
                    irtu : parseInt(_itru_addr),
                    op : 0x03, //查询
                    cno : ctrlno
                    }
                  };
                  /******* to add 查询状态 ***************/
                  // loopcontrolhelper.request(_req_data,function(err,res){
                  //   //parse res;
                  //   // code: 0 des: 已断开;  code: 1 des: 断开电路
                  //   lines[i].controlCfg = {
                  //     sid : _isdc_addr,
                  //     itru : parseInt(_itru_addr)
                  //     cno : ctrlno
                  //   };
                  //   // set status;
                  //   ep.emit('status');
                  //   done();
                  // });
                  lines[i].controlCfg = {
                    sid : _isdc_addr,
                    irtu : parseInt(_itru_addr),
                    cno : ctrlno
                  };
                  // set status;
                  lines[i].status = 1;
                  lines[i].statusDescription = '断开回路';
                  console.log(lines[i]); // 打印可控制回路信息
                  ep.emit('status');
                  done();
                })
              })
            });
          }else{
            lines[i].status = -1;
            lines[i].statusDescription = '断开回路';
            ep.emit('status');
          }

        }else{
          // do not config control irtu
          lines[i].status = -1;
          lines[i].statusDescription = '断开回路';
          ep.emit('status');
        };
      })(x);
    }
    //batch end
    batch.end();

  })
}

