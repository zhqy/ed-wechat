//render helper. by 2yuri

var logger = require('./logger');
var moment = require('moment');

var _compile = function(file,type){
	if (type == 'javascript') {
		return '<script src="/public/js/' + file + '.js"' 
		 + ' type="text/javascript"></script>';
	}
	if (type == 'css') {
		return '<link href="/public/css/' + file + '.css"'
		+ ' rel="stylesheet" type="text/css"/>';
	}
	return '';
}

var render_text = function(type){
	var _type =  type;
	return function(files){
		logger.debug('load scripts');
		var output = [];
		if ( !files ) {
			return '';
		}else{
			var i = 0;
			for(; i < files.length ; i++){
				output.push(_compile(files[i],_type));
			}
			logger.debug(output.join(''));
			return output.join('');
		}
	};
}

var formatTime = function(t){
	var D = moment(t);
	if (D.isValid()) {
		var d = {};
		d.d = D.format('YYYY-M-D');
		d.t = D.format('HH:mm');
        var wd = D.weekday();
        switch(wd){
            case 1 :{
                d.w = '星期一';
                break;
            }
            case 2 :{
                d.w = '星期二';
                break;
            }
            case 3 :{
                d.w = '星期三';
                break;
            }
            case 4 :{
                d.w = '星期四';
                break;
            }
            case 5 :{
                d.w = '星期五';
                break;
            }
            case 6 :{
                d.w = '星期六';
                break;
            }
            case 7 :{
                d.w = '星期日';
                break;
            }
            default:{}
        }
        d.ds = D.format('M-D');
		return d;
	}
	return null;
}

var buildPicUrl = function(s){
	var a = s.split('/');
	return 'http://103.30.148.71/' + a[1] + '/' + a[2];
}

var parsecf =  function(s){
    if(s.indexOf('Infinity')!=-1){
        return 'NA';
    }else{
        return s;
    }
}
//加载页面级别的脚本和样式
exports.render_script  = render_text('javascript');
exports.render_css = render_text('css');
exports.formatTime = formatTime;
exports.buildPicUrl = buildPicUrl;
exports.parsecf = parsecf;
