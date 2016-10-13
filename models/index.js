/*
 * mongodb & models
 * created by 2yuri.
 */
 
var mongoose = require('mongoose');
var config   = require('../config');

mongoose.connect(config.db, {
  server: {poolSize: 5}
}, function (err) {
  if (err) {
    console.error('connect to %s error: ', config.db, err.message);
    process.exit(1);
  }
});

require('./wechatuser');
require('./systemuser');
require('./enterprise');
require('./building');
require('./alarm');
require('./isdc');
require('./energy');
require('./switchbox');
require('./imeter');
require('./irtu');

exports.WechatUser = mongoose.model('WechatUser');
exports.SystemUser = mongoose.model('User');
exports.Enterprise = mongoose.model('Emterprise'); //原始数据库命名错误
exports.Building = mongoose.model('BuildingInfo');
exports.Alarm = mongoose.model('Alarm');
exports.ISDC = mongoose.model('ISDC');
exports.ISDCCyclesEnergy = mongoose.model('ISDCCyclesEnergy');
exports.ISDCEnergyDailyStatistics = mongoose.model('ISDCEnergyDailyStatistics');
exports.IMeterCyclesEnergy = mongoose.model('IMeterCyclesEnergy');
exports.IMeterEnergyDailyStatistics = mongoose.model('IMeterEnergyDailyStatistics');
exports.SwitchBox = mongoose.model('SwitchBox');
exports.IMeter = mongoose.model('IMeter');
exports.IMeterDayLog = mongoose.model('IMeterDayLog');
exports.IMeterDataLog = mongoose.model('IMeterDataLog');
exports.IRTU = mongoose.model('IRTU');

