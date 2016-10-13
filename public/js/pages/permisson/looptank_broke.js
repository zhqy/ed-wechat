$(function(){
    setTimeout(function() {
        var q = window.location.search;
        var qlist = q.split('&');

        var wxid, xtid;
        // **** mody
        var fromsb = false;
        var sbid;

        for(var i = 0; i < qlist.length; i++){
            var item = qlist[i];
            if(item.indexOf('wxid')!= -1){
                wxid = item.split('=')[1];
            }
            if(item.indexOf('xtid')!= -1){
                xtid = item.split('=')[1];
            }
            if(item.indexOf('fromsb')!= -1){
               fromsb = true;
            }
            if(item.indexOf('sbid')!= -1){
                sbid = item.split('=')[1];
            }
        }
        if(xtid && wxid){
            if(!fromsb){
              window.location.href = '/web/index?wxid=' + wxid + '&xtid=' + xtid;
            }else{
              window.location.href = '/web/switchbox/'+sbid+'?wxid='+wxid+'&xtid='+xtid;
            }
        }
    }, 2000);
})
