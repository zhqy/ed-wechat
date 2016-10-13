/*
 * created by 2yuri.
 * building index page socket script.
 */


(function($){
	var currentBuildingId = $('#cur_building').attr('data-id');

/**************************socket管理***************************/
	var webSocketManager = {
        socket: null,
        initialize: function (config) {
            var _this = this;
            console.log("http://" + config['host'] + ":" + config['port']);
            this.socket = io.connect("http://" + config['host'] + ":" + config['port']);
            this.bInit = true;
            this.sType = '0';
            this.socket.on('alarm', function (data) {
            	//告警信息红点提醒
                // window.oTopAlarmManager && window.oTopAlarmManager.initList();
                alarmManager.changeAlarmTags(JSON.parse(data));
            });
            this.socket.on('list', function (data) {
                if (data) {
                    alarmManager.initAlarmTags(data);
                }
            });
            // this.socket.on('typelist', function (data) {
            //     alarmManager.reflection(_this.sType, data);
            // });

            this.create();
        },
        create: function () {
            console.log(currentBuildingId);
            this.socket.emit('create', { bid: currentBuildingId });
        },
        change: function () {
            this.socket.emit('change', { bid: currentBuildingId });
        },
        getTypeListData: function (sType) {
            this.sType = sType;
            this.socket.emit('gettypelist', { type: sType });
        }
    };

/**************************alarm管理***************************/
    var  alarmManager = {
    	//初始化告警状态
    	initAlarmTags : function(data){
    		var allTypeAlarms = {};
    		if (!data) {
    			return;
    		}
    		var j = 0;
    		for(; j < data.length ; j++){
    			var temp = JSON.parse(data[j]);
    			this.setAlarmTag(temp.type,temp);
    		}
    	},

    	setAlarmTag : function(type,data){
    		//合并过、欠压、线损
    		if (type == '1' || type == '4' || type == '5') {
    			type = '1-4-5';
    		}
    		var rank = data['rank'];
    		if (rank) {
    			var alarmClass; 
    			if (rank == 'yellow') {
    				alarmClass = 'abnormal';
    			}else if(rank == 'red'){
    				alarmClass = 'alarm';
    			}
                $('#alarm_list span[data-alarm-type="' + type + '"]').html(data['type'] == 8 ? '告警' : data['value']).parents('.item').removeClass('normal abnormal alarm').addClass(alarmClass);
            } else {
                $('#alarm_list_c span[data-alarm-type="' + type + '"]').html('正常').parents('.item').removeClass('abnormal alarm').addClass('normal');
            }
    	},
    	//动态变化
    	changeAlarmTags : function(data){
    		var alarms = data['alarms'], sKey = '', isend = data.isend;
            for (sKey in alarms) {
                if (!isend && !alarms[sKey]['rank']) {
                    continue;
                }
                if (alarms[sKey]['rank'] != undefined) {
                    this.setAlarmTag(sKey, alarms[sKey]);
                }
            }
    	}
    };
/**************************能耗趋势***************************/
var energyTrendManager = {
    initialize : function(){
        this._createChart();
    },

    _createChart : function(){
        var that = this;
        this._getChartData({id : currentBuildingId},function(err,data){
            if (err) {
                that._renderError();
            }else{
                if (data.state) {
                    that._renderChart(data);
                }else{
                    that._renderError(data);
                }
            }
        });
    },

    _getChartData : function(params,callback){
        console.log(params);
        $.ajax('/api/getenergydata', {
        data: params,
        dataType: 'json',
        // cache: false,
        success: function (data) {
            callback(null,data);
        },
        error : function(xhr,status,message){
            callback(new Error(message));
        }
    })
    },

    _renderError : function(error){
        $('#container').html(error ? error.message : '获取数据失败').css({ 'textAlign': 'center', 'color': 'red' });
    },

    _renderChart : function(data){
        var cate = [], seri = {data : []};
        var pace = data.pace;
        var nums = Math.floor(pace * 60 / 5 );
        var tempvalues = [];
        $.each(data.data,function(index,energy){
            // cate.push(energy.CreateDateTime);
            var value = 0,j = 0;
            for(; j < 4; j++){
                value +=  energy.Values[j];
            }
            tempvalues.push(value);
            if(tempvalues.length == nums){
                var _t = 0;
                for(var n = 0; n < nums; n++){
                    _t += tempvalues[n];
                }
                seri.data.push(parseFloat(_t.toFixed(2)));// 两位小数
                var cdt = moment(energy.CreateDateTime);
                cate.push(cdt.format('YYYY-M-D HH:mm'));
                tempvalues = [];//置空
            }
            // seri.data.push(value);
        });
        seri.name = '电能耗';
        seri.tooltip = {
            valueSuffix: ' kWh'
        };

        $('#container').highcharts({
        chart: {
            renderTo: 'chart_line', 
            backgroundColor:'#fff',
            height:140
        },
        title: {
            text: '能耗趋势',
            align:"left",
            style : {"font-size" : "16px"}
        },
        colors: ['#5496e3'],
        credits: {
            enabled: false
        },
        xAxis: {
            tickWidth:0, 
            gridLineWidth: 0,
            lineColor:'#fff',
            categories: cate,
            labels: {
                        step: 3,
                        rotation: 15,
                        style: {
                            color: '#AAACAD'
                        },
                        formatter: function () {
                            return this.value.split(' ')[1];
                        }
                    }
        },
        yAxis: [{
            tickWidth:0, 
            gridLineWidth: 0,
            lineColor:'#fff',
            labels: {
                enabled: false
            },
            title: {
                text: ''
            }
        }],
        legend: {
            enabled: false
        },
        series: [seri]
     });
    }
}

/**************************各个模块启动，获取数据***************************/
	$.ajax('/api/alarmwebsocketconfig',{
		dataType: 'json',
        cache: false,
        success: function (config) {
            console.log(config);
            webSocketManager.initialize(config);
        }
	});
    energyTrendManager.initialize();
    //注册一个类型告警信息函数 11.25
    $(function(){
        $('.item > a').click(function(){
            if($(this).parent().hasClass('normal')){
                $('#fails_alert').show();
                setTimeout(function(){
                    $('#fails_alert').hide();
                },2000);
                return false;
            }
        })
    });
})(jQuery);