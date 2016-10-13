// energy history
// by 2yuri
(function($){
    var energyManager = {
        start : function(){
            this.bid = $('#chart_spline')[0].attributes[1].value;
            this.type = 'Year';
            this.time = moment().year();
            $('#appYear').val(this.time);
            this.getenergydata();
        },
        getenergydata : function(){
            var that = this;
            var params = {
                buildingid : this.bid,
                time : this.time,
                type : this.type
            };
            console.log(params);
            $.ajax('/api/gethistoryenergydata', {
                data: params,
                dataType: 'json',
                cache: false,
                success: function (data) {
                    that.renderchart(null,data.data,params.type);
                },
                error : function(xhr,status,message){
                    that.renderchart(new Error(message));
                }
            });
        },
        // data : {state : , data : {x : [], y :[]}}
        renderchart : function(err,data,type){
            //
            var yearX = function(v){
                var r;
                var m = v.split(' ')[1];
                switch(m){
                    case '1月':
                     r = '一';
                     break;
                    case '2月':
                     r = '二';
                     break;
                    case '3月':
                     r = '三';
                     break;
                    case '4月':
                     r = '四';
                     break;
                    case '5月':
                     r = '五';
                     break;
                    case '6月':
                     r = '六';
                     break;
                    case '7月':
                     r = '七';
                     break;
                    case '8月':
                     r = '八';
                     break;
                    case '9月':
                     r = '九';
                     break;
                    case '10月':
                     r = '十';
                     break;
                    case '11月':
                     r = '十一';
                     break;
                    case '12月':
                     r = '十二';
                     break;
                }
               return r;
            };
            var monthX = function(v){
              var i = v.indexOf('日');
              var j = v.indexOf('月');
              return v.substring(j + 1, i);
            };
            var weekX = function(v){
                var d = v[2];
                return (d == '日')? '七' : d;
            }
            if(err || data.state == false){
                $('#highcharts').html('获取数据失败');
            }else{
                var h =$(window).height();
                $('#highcharts').highcharts({
                    chart: {
                        type: 'column',
                        backgroundColor: 'none',
                        renderTo: 'chart_spline', 
                        height:h-88
                    },
                    title: {
                        text: ''
                    },
                    colors: ['#25cbbd'],
                    credits: {
                        enabled: false
                    },
                    xAxis: {
                        tickWidth:0, 
                        gridLineWidth: 0,
                        lineColor:'#fff',
                        labels: {
                            y: 30, //x轴刻度往下移动20px
                            rotation:45,
                            style: {
                                color:'#25cbbd', //颜色
                                fontSize:'12' //字体
                            },
                            formatter: function () {
                                if(type == 'Year'){return yearX(this.value)};
                                if(type == 'Month'){return monthX(this.value)};
                                if(type == 'Week'){return weekX(this.value)};
                            }
                        },
                        scrollbar: {
                           enabled: true
                        },
                        tickInterval: type == 'Month'? 5:1,
                        categories: data.x
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
                    plotOptions:{
                        column: {
                            // pointWidth:35,
                            dataLabels: {
                                enabled: false,
                                formatter: function () {
                                    return this.y;
                                },
                                style:{
                                    color:'#000',
                                    fontSize:'12'
                                }
                            }
                        }
                    },
                    series: [{
                        name: '电能耗',
                        data: data.y,
                        tooltip: {
                            valueSuffix: ' kWh'
                        }
                    }]
                });
            }
        }
    }
    
    $(function(){
        //mobicroll config
        var theme, mode, display, lang;
        theme = undefined;
        mode = 'scroller'; 
        display = 'modal';
        lang = 'zh';
        
        //set mibocroll
        $('#year_treelist').mobiscroll().treelist({
            theme: theme,      
            mode: mode,       
            display: display, 
            lang: lang,
            showInput : false,            
            onSelect : function(v,obj){
                console.log(v);
                var year = $('#year_treelist > li')[v].childNodes[0].data.trim();
                $('#appYear').val(year);
                energyManager.time = year;
                energyManager.type = 'Year';
                energyManager.getenergydata();
            }        
        });
        $('#week_treelist').mobiscroll().treelist({
            theme: theme,      
            mode: mode,       
            display: display, 
            lang: lang,      
            labels: ['Year', 'Week'], 
            showInput : false,
            onSelect : function(value,obj){
                var keys = value.split(' ');
                var year = keys[0];
                var week = keys[1];
                var year_value = $('#week_treelist > li')[year].childNodes[0].data.trim();
                var week_value = $($('#week_treelist > li')[year]).find('li')[week].innerText;
                var begtime = new Date(year_value + '/' + week_value.split('~')[0].replace('-','/'));
                $('#appYear').val(year_value + '-' + week_value)
                energyManager.time = begtime;
                energyManager.type = 'Week';
                energyManager.getenergydata();
            }
        });
        $('#month_treelist').mobiscroll().treelist({
            theme: theme,      
            mode: mode,       
            display: display, 
            lang: lang,      
            labels: ['Year', 'Month'], 
            showInput : false,
            onSelect : function(value,obj){
                var keys = value.split(' ');
                var year = keys[0];
                var week = keys[1];
                var year_value = $('#month_treelist > li')[year].childNodes[0].data.trim();
                var month_value = $($('#month_treelist > li')[year]).find('li')[week].innerText;
                $('#appYear').val(year_value + '-' + month_value)
                energyManager.time = year_value + '-' + month_value;
                energyManager.type = 'Month';
                energyManager.getenergydata();
            }
        });
            
        //init event
        $('#week').click(function(){
            $('#week_treelist').mobiscroll('show');
            $(this).addClass('current').siblings().removeClass('current');
        });
        $('#year').click(function(){
            $('#year_treelist').mobiscroll('show');
            $(this).addClass('current').siblings().removeClass('current');            
        });
        $('#month').click(function(){
            $('#month_treelist').mobiscroll('show');        
            $(this).addClass('current').siblings().removeClass('current');                        
        });
        
        //start
        energyManager.start();
    });
})(jQuery)