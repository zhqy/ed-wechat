
/*
 * EMC-TECH 微信公众号
 * 2016.10.10
 * 2.0.0
 */

require('colors');
var path = require('path');
var express = require('express');
var config = require('./config');
var web_router = require('./web_router');
var api_router = require('./api_router');
var bodyParser = require('body-parser');
var logger = require('./common/logger');
var _ = require('lodash');
require('./models');

// 微信菜单初始化
if (config.wechat_build_menu) {
	var menu = require('./tools/menu');
	menu.build();
	menu.ready(function() {
		logger.info('wechat menu has created!');
	})
}

var app = express();

// 视图设置
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs-mate'));
app.locals._layoutFile = 'layout.html';
app.enable('trust proxy');

// request logs
app.use(require('./middlewares/request_log'));

// static files
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(require('response-time')());
app.use(bodyParser.json({
	limit: '1mb'
}));
app.use(bodyParser.urlencoded({
	extended: true,
	limit: '1mb'
}));
app.use(require('method-override')());
app.use(require('cookie-parser')(config.cookie_secret));

// dynamic helper
_.extend(app.locals, require('./common/render_helper'));

var wechat_message = require('wechat')({
	token: config.wechat_message_token
});
wechat_message.event(function(message, req, res, next) {
	if (message.Event === 'subscribe') {
		res.reply({
			type: 'text',
			content: config.wechat_welcome_message || 'welcome!'
		});
	} else {
		next();
	};
});

// wechat messages
// use '/wx' for test. wechat binding server ttfb 1.8s respond timeout -107.
app.get('/', wechat_message.middlewarify());
//app.use('/wx', function(req, res, next) {
//		res.reply({
//			type: 'text',
//			content: config.wechat_default_message || 'welcome!'
//		});
//	})
	// web router
app.use('/web', web_router);

// api router
app.use('/api', api_router);

// test html5
app.get('/date',function(req,res,next){
	res.render('date',{title : 'test'});
})

// error handle
if (!config.dev) {
	app.use(function(err, req, res, next) {
		logger.error('500 Server Error', err);
		return res.status(500).send('500 Server error');
	});
};

app.listen(config.port, function() {
	logger.info('Wechat Server Running @ Port: ' + config.port);
});
