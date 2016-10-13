// WEB路由设置

var permission = require('./controller/permission');
var home = require('./controller/home');
var building = require('./controller/building');
var switchbox = require('./controller/switchbox');
var router = require('express').Router();

router.get('/login',permission.getlogin);
router.post('/login',permission.postlogin);
router.get('/loopcontrol',permission.getcontrolpasswordlogin);
router.post('/loopcontrol',permission.postcontrolpasswordlogin);

//修改控制密码
router.get('/new_pw',permission.getnewpw);
router.post('/new_pw',permission.postnewpw);
router.get('/pw_confirm',permission.getpwconfirm);
router.post('/pw_confirm',permission.postpwconfirm);

//系统首页
router.get('/index',home.index);
router.get('/index/user_profile',home.getuserprofile);
router.get('/index/building_manage',home.buildingmanage);
router.get('/index/warnings',home.getwarinings);

//建筑
router.get('/building/:id',building.index);
router.get('/building/:id/energy_consumption',building.energyConsumption);
router.get('/building/:id/history_consumption',building.historyConsumption);
router.get('/building/:id/switchbox',building.getswitchbox);
router.get('/building/:id/warnings',building.getalarms);

//配电箱
router.get('/switchbox/:id',switchbox.index);


module.exports = router;
