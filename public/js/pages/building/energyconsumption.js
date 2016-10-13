// energy ranklist
// created by 2yuri.

(function($){
var energyManager = {
	initialize : function(){
        $('#day').addClass('current').siblings().removeClass('current');
        $('#appYear').val(moment().subtract(1,'days').format('YYYY-M-D'));        
    // 默认取当天（前一天）的排行数据
        this.starttime = new Date(moment().startOf('day').subtract(1,'days').format());
		this.endtime = new Date(moment().endOf('day').subtract(1,'days').format());
		this.bid = $('.lists')[0].attributes[1].value;
		this.getImeterEnergyData();
	},
	getImeterEnergyData : function(){
		var that = this;
		var params = {
			buildingid : this.bid,
			starttime : this.starttime,
			endtime : this.endtime
		};
        console.log(params);
		$.ajax('/api/getimeterenergydata', {
	        data: params,
	        dataType: 'json',
	        cache: false,
	        success: function (data) {
	            that.renderlist(null,data);
	        },
	        error : function(xhr,status,message){
	            that.renderlist(new Error(message));
	        }
    	});
	},
	renderlist : function(err,data){
		if (err || data.state === false) {
			console.log(data);
			$('.lists').html('获取数据失败');
		}else{
			$('.lists').html($(data.data));
        }
	}
};
$(function(){
    //mobicroll config
    var theme, mode, display, lang;
    theme = undefined;
    mode = 'scroller'; 
    display = 'modal';
    lang = 'zh';
    
    //start
    energyManager.initialize();
    //set treelist data(bankend)
    
    //set mibocroll function
    $('#day').mobiscroll().date({
        theme: theme,      
        mode: mode,       
        display: display, 
        lang: lang,
        onSelect : function(v,obj){
            $(this).addClass('current').siblings().removeClass('current');            
            
            console.log(v);
            $('#appYear').val(v);
            var begtime = new Date(v);
            var endtime = new Date(moment(begtime).endOf('day').format());
            energyManager.starttime = begtime;
            energyManager.endtime = endtime;
            energyManager.getImeterEnergyData();
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
            var endtime = new Date(year_value + '/' + week_value.split('~')[1].replace('-','/'));
            $('#appYear').val(year_value + '-' + week_value)
            energyManager.starttime = begtime;
            energyManager.endtime = endtime;
            energyManager.getImeterEnergyData();
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
            var begtime = new Date(year_value + '/' + month_value + '/1');
            var mbt = moment(begtime).endOf('month');
            var endtime = new Date(mbt.format());
            $('#appYear').val(year_value + '-' + month_value)
            energyManager.starttime = begtime;
            energyManager.endtime = endtime;
            energyManager.getImeterEnergyData();
        }
     });
        
    //init event
    $('#week').click(function(){
        $('#week_treelist').mobiscroll('show');
        $(this).addClass('current').siblings().removeClass('current');
    });
    $('#day').click(function(){
        //$(this).addClass('current').siblings().removeClass('current');            
    });
    $('#month').click(function(){
        $('#month_treelist').mobiscroll('show');        
        $(this).addClass('current').siblings().removeClass('current');                        
    })
});
})(jQuery)