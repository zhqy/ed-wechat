// api router 
// by 2yuri

var router = require('express').Router();
var api = require('./controller/ajax_api');

router.get('/getenergydata', api.getenergydata);

router.get('/alarmwebsocketconfig', api.alarmwebsocketconfig);
router.get('/getimeterenergydata', api.getimeterenergydata);
router.get('/gethistoryenergydata',api.gethistoryenergydata);
router.post('/managebuildings', api.managebuildings);
router.get('/getimeterdatalogs',api.getimeterdatalogs);

router.get('/logout', api.logout);

module.exports = router;