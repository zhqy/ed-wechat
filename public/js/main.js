var h =$(window).height();
$(function() {
    //历史能耗
    var liCurNum = $(".histabs li.cur").index();
    tabConShow(liCurNum);
    function tabConShow(index) {
        $(".tabitem").hide();
        $(".tabitem").eq(index).show();
    }
    $(".histabs li").mouseover(function() {
        var lis = $(this)
        lis.addClass("cur");
        lis.siblings().removeClass("cur");
        liCurNum = lis.index();
        tabConShow(liCurNum);
    })
    //筛选操作
    $(".filter-bar > li").on("click", function() {
        if (!$(this).hasClass("active")) {
            $(this).addClass("active").siblings("li").removeClass("active");
            $(".filter-bar-wrapper").addClass("expanded")
        } else {
            $(".filter-bar > li").removeClass("active");
            $(".filter-bar-wrapper").removeClass("expanded")
        }
    });
    $(".filter-mask").on("click", function() {
        $(".filter-bar > li").removeClass("active");
        $(".filter-bar-wrapper").removeClass("expanded")
    });
})  
//能耗排行
$(function () {
    $('#highcharts').highcharts({
        chart: {
            type: 'column',
            renderTo: 'chart_spline', 
            height:h-142
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
                y: -10, //x轴刻度往下移动20px
                style: {
                    color:'#fff', //颜色
                    fontSize:'13' //字体
                }
            },
            categories: ['四月', '五月', '六月', '七月', '八月']
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
                    enabled: true,
                    formatter: function () {
                        return this.y + 'kw';
                    },
                    style:{
                        color:'#000',
                        fontSize:'15'
                    }
                }
            }
        },
        series: [{
            name: '电能耗',
            data: [ 14.5, 18.2, 18.3, 23.9, 20.45],
            tooltip: {
                valueSuffix: 'kWH'
            }
        }]
     });
});




