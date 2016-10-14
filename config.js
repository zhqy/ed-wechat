var dev = {
	wechat_appid:'wx4df221a4e9845aea',
	wechat_secret:'c2c6e3220de9609c79e3d1f425bba0fb',

	wechat_message_token:'emc-data',
	wechat_welcome_message:'欢迎词',
	wechat_default_message:'更多功能，请点击菜单，进入系统首页',

	wechat_build_menu:false,

	cookie_secret:'emc-data',
	host:'http://54.222.222.111', //aws开发环境，ssh隧道至本地
	port:8090,

	db:'mongodb://54.222.222.111/pw_sys_test',

  alarmwebsocket: {
  	port: 5001,
  	host: '103.30.148.71'
  },

	energy_trend_period : 24, //能耗图区间为10个小时
	energy_trend_pace : 1,//间隔是1个小时
	// 开发环境
	dev:true,

	redisServer : {
		port : '6379',
		host : '103.30.148.71'
	},

	websocketServer:{
		host : '103.30.148.71',
		port : '5002'
	}
}

// 生产环境配置
// TODO: remove to single file.

var prd = {
	wechat_appid:'wx93878e41151f96be',
	wechat_secret:'51e1158122f6ce2f7baef72fe9db2b19',
	wechat_encodingAESKey : '631SAGjrjcYcuMiSAUoVxbmOWougodNzvAnqLuhPd1M',

	wechat_message_token:'emcdata',
	wechat_welcome_message:'欢迎词',
	wechat_default_message:'更多功能，请点击菜单，进入系统首页',

	wechat_build_menu:false,

	cookie_secret:'emc-data',
	host:'http://wx.emcdata.com', //aws开发环境，ssh隧道至本地
	port:8090,

	db:'mongodb://172.31.29.220/pw_sys',

  alarmwebsocket: {
  	port: 5001,
  	host: '54.223.230.121'
      // host: 'localhost'
  },

  energy_trend_period : 24, //能耗图区间为10个小时
	energy_trend_pace : 1,//间隔是1个小时
	dev:false,

	//redis服务器
	redisServer : {
		port : '6379',
		host : '172.31.24.76'
	},
	//回路控制websocket server
	websocketServer:{
		host : '54.223.230.121',
		port : '5002'
	}
}
module.exports = process.env.NODE_ENV=='dev'? dev: prd;
