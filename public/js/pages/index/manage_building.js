//modify by 2yuri.

$(function() {
	$(".js_deleteBtn").click(function() {
		$("#cur_list .cover_bg,#cur_list .cover_delete_btn").show();
        //+号处理
        $('#cur_list .cover_add_btn').removeClass('cover_add_btn').addClass('cover_delete_btn').show();
	})
	$(".content li").click(function() {
		var str = $(this).attr('id').split("_")[1];
		$('.popbg,.popBox').val(str);
		// block or inline.
		var cover = $(this).find(".cover_btn").css("display");
        var isAdd = $(this).find('.cover_btn').hasClass('cover_add_btn');
        // can't use !isAdd ????????  what a big bug! note by 2yuri
        // ????
		if ((cover == 'inline' || cover == 'block')) {
            if(isAdd == false){
                // when showdilog + appear?? why
			showDilog();
            }
		}
	})
    //确定删除
	$(".confirm").click(function() {
		del();
	})
	$(".cancel,.popbg").click(function() {
		cancel();
	})
    //完成
	$(".deleteBtn").click(function(){
		// finish.
		$(".pack .cover_bg,.cover_delete_btn,.cover_add_btn").hide();

		var cur_list = $("#cur_list li");
		var cur_buildings = [];
		if (cur_list) {
			$.each(cur_list,function(key,cur){
				cur_buildings.push($(cur).attr('id').split("_")[1]);
			})
		};
		var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
		var wxid = hashes[0].split('=')[1];
		var xtid = hashes[1].split('=')[1];
        if(xtid[xtid.length - 1] == '#'){
            xtid = xtid.slice(0,xtid.length - 1);
        }
		console.log(cur_buildings);
		var data = {
			currentBuildings : cur_buildings,
			wxid : wxid,
			xtid : xtid
		}
		$.ajax('/api/managebuildings',{
			data : {data : JSON.stringify(data)},
			dataType : 'json',
			cache : false,
			method : 'POST',
			success : function(ret){
				if (ret && ret.error == 0) {
					render('success');
				}else{
					render('fails');
				}
			},
			error : function(){
				render('fails');
			}
		})
	})
    
    //添加
	$("#add_list li").click(function(){
        //判断是否是待添加的建筑
        if($(this).parent().parent().attr('id') == 'add_list'){
            $("#cur_list ul").append(this);
            //加特效
            $(this).find('.cover_btn').removeClass('cover_delete_btn').addClass('cover_add_btn').show();
            $(this).find('.cover_bg').show();
            
            if ($("#add_list li").length == 0) {
                $('.graphictext').hide();
            };
        }
	})
})

function render(msg){
	var name = '#' + msg + '_alert';
	$(name).show();
	setTimeout(function(){
		$(name).hide();
	},2000);
}

function showDilog() {
    $('.popbg,.popBox').show();
}

function del() {
    var strVal = $('.popbg,.popBox').val();
    var cur_item = $("#li_" + strVal);
    cur_item.find(".cover_bg,.cover_delete_btn").hide();
    
    //减 +号
    cur_item.find('.cover_add_btn').hide();
    
    $('#add_list ul').append($("#li_" + strVal));
    $('.popbg,.popBox').hide();
    
    //是否显示文字
    if ($('#cur_list li').length == 0) {
    	$('.graphictext').show();
    }
    //先解除add list li 的click事件
    $('#add_list li').off();
    
    //再重新绑定.
    $("#add_list li").click(function(){
		$("#cur_list ul").append(this);
        
        //加特效
        $(this).find('.cover_btn').removeClass('cover_delete_btn').addClass('cover_add_btn').show();
        $(this).find('.cover_bg').show();
		if ($("#add_list li").length == 0) {
			$('.graphictext').hide();
		};
	});
}

function cancel() {
    $('.popbg,.popBox').hide();
}