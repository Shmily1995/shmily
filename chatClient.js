/*客户端socket.io接收与发送*/
try{
//连接socket服务器
var socket = new io("http://192.168.1.109:7130");
}catch(e){
	_alert("nodejs服务器没开啊",3);
}

var users  = null; 
var shutupuser = null;
var userinfo = null;
//连接状态设置为成功
_show.nodeChat = 1;
_show.enterChat = 1;
////////////////////////////////////////////////////////////////////////////////////
var wlSocket = {
	nodejsInit:function(){
		$.ajax({
			type:"get",
			url:"/index.php/User/inituserinfo/roomnum/"+_show.roomId,
			async:true,
			success:function(json){
			
				var userinfo = evalJSON(json);

				wlSocket.inituser(userinfo);
			}
		});
	},
	nodejschatToSocket:function (val){
		/*js封装好的数据(json对象)*/
		var obj_json = JSON.parse(val);
		var msg ="";
		
		if(_show.nodeChat!=1){
			console.error("nodejs连接异常");return;
		}
		switch(obj_json._method_){
			/*消息发送*/
			case 'SendPubMsg':
			      for(var i in shutupuser){
			      	  if(shutupuser[i].susername==_show.username){
			      	  	chatFromSocket("{retcode:409002}");
			      	  	return;
			      	  }
			      }
			      msg = "{\"msg\":[{\"_method_\":\"SendMsg\",\"action\":0,\"ct\":\""+obj_json.ct+"\",\"msgtype\":\"2\",\"timestamp\":\""+WlTools.FormatNowDate()+"\",\"tougood\":\"\",\"touid\":\"\",\"touname\":\"\",\"ugood\":\""+_show.curroomnum+"\",\"uid\":\""+_show.userId+"\",\"uname\":\""+userinfo.nickname+"\"}],\"retcode\":\"000000\",\"retmsg\":\"OK\"}";
			     
			      break;
			 /*礼物发送*/
			case 'sendGift'  :
			
			      var giftinfo_strjson = "{\"giftPath\":\""+obj_json.giftPath+"\",\"giftStyle\":\""+obj_json.giftStyle+"\",\"giftGroup\":\""+obj_json.giftGroup+"\",\"giftType\":\""+obj_json.giftType+"\",\"toUserNo\":\""+obj_json.toUserNo+"\",\"isGift\":\""+obj_json.isGift+"\",\"giftLocation\":\""+obj_json.giftLocation+"\",\"giftIcon\":\""+obj_json.giftIcon+"\",\"giftSwf\":\""+obj_json.giftSwf+"\",\"toUserId\":\""+obj_json.toUserId+"\",\"toUserName\":\""+obj_json.toUserName+"\",\"userNo\":\""+obj_json.userNo+"\",\"giftCount\":\""+obj_json.giftCount+"\",\"userId\":\""+obj_json.userId+"\",\"giftName\":\""+obj_json.giftName+"\",\"userName\":\""+obj_json.userName+"\",\"giftId\":\""+obj_json.giftId+"\"}";
			      msg = "{\"msg\":[{\"_method_\":\"SendMsg\",\"action\":\"3\",\"ct\":"+giftinfo_strjson+",\"msgtype\":\"1\",\"timestamp\":\""+WlTools.FormatNowDate()+"\",\"tougood\":\"\",\"touid\":\"0\",\"touname\":\"\",\"ugood\":\"\",\"uid\":\"0\",\"uname\":\"\"}],\"retcode\":\"000000\",\"retmsg\":\"OK\"}";
			     
		}
		
		socket.emit('sendmsg',msg);
	
   },
   inituser:function(data){

   	     /*用户init*/
		// _userBadge, _familyname, _goodnum, _h, _userlevel, _richlevel, _spendcoin, _sellm, _sortnum, _userType, _userid, _username, _vip, _root.roomId
		userinfo = {
				uid          :data.userid,
				roomnum      :_show.roomId,
				nickname     : data.username,
				equipment    :'pc',
				userBadge    :'',
				goodnum      :data.goodnum,
				h            :data.h,
				level        :data.level,
				richlevel    :data.richlevel,
				spendcoin    :data.spendcoin,
				sellm        :data.sellm,
				sortnum      :data.sortnum,
				username     :data.username,
				vip          :data.vip,
				familyname   :'',
				userType     :data.userType
		};
		data.h = data.h == '0'?'':data.h;
		if(parseInt(data.err)!=0){

			socket.emit('cnn',userinfo);
			setInterval(function(){

                if(_show.nodeChat != 1){

                    $("#chat_hall").append("<font color='red'>node服务器录像启....</font><br>");
                }
            },2000);
		}
		
   }
	
}


/*客户端广播接收*/
/*客户端监听用户连接事件广播*/

socket.on('Conn',function(data){
	var data = evalJSON(data);
	_show.nodeChat = 1;
	appInterface.getChatOnline(data.msg[0]);
	
});
/*客户端监听禁言广播*/
socket.on('Shutup',function(data){
	shutupuser = data;
});
/*客户端监听消息广播*/
socket.on('showmsg',function(data){
      
	JsInterface.chatFromSocket(data);
});
/*客户端监听用户加入广播*/
socket.on('join',function(data){
	var userinfo_json = evalJSON(data);
	//console.log(userinfo_json)
	JsInterface.chatFromSocket(data);
});



var appInterface = {
	getMsgstrs:[],
	inCount:0,
	person:"",
	arrManage:[],
	arrPeople:[],
	arrVisitor:[],
	cntManage:0,
	cntPeople:0,
	guePeople:0,     //guest
	liveTimer:null,
	minCount:500,
	initnum:0,
	inituserlist:0,
	inf:0,
	inf2:0,
	ing:0,
	ing2:0,
	isAll:0,
	minorder:0,
	initLogin:0,
	getChatOnline:function(data){ //fet onlinelist
		
		//clear_data deal
		this.arrPeople=[];
		this.arrManage=[];
		this.cntManage=0;
		this.cntPeople=0;
		this.arrVisitor=[];
		var udata=data["ct"];
		console.log(data)
		this.person=udata[1]['ulist'];
		
		this.cntPeople=parseInt(udata[1]["ulist"].length);
		if(this.cntPeople==0)return;
		this.guePeople=parseInt(udata[0]["tucount"]);  //guest
		var perobj=this.person;
		this.initnum=perobj.length;
		this.initnum=(this.initnum > this.minCount) ? this.minCount : this.initnum;
		this.minorder=parseInt(perobj[this.initnum-1]["sortnum"]);//min ordernum
		var uinitnum=this.initnum;
		for(var b=0;b<uinitnum;b++){
			var user=perobj[b],utype=perobj[b]["userType"];
			if(utype==40){this.arrManage.push(user);this.cntManage++;}
			if(utype==20){
				this.arrVisitor.push(user);
			}else{
				this.arrPeople.push(user);
				
			}
		}
		
		/*
		userType:用户类型  主播：50   管理员：40   普通用户：30   游客：20   巡管：10   僵尸:5
		*/
		//20120827 altheran
		//this.arrPeople.sort(this.sortBy(true));

//		alert(this.arrPeople.length)
		this.appchatPeople();
		this.appchatManage();

	},
	appchatPeople:function(){
		var userArray=[],visitorArray=[],giftArray=[],chatArray=[],pitem="",vitem="";
                //tieTiaoArray=[];
		var arrPeople=this.arrPeople;
		
		clearInterval(ttsi);
		for(var key in arrPeople){ //chatonline
			var strOn0="",strOn1="",strOn2="",ptxt="",pcolor="";
			pitem=arrPeople[key];
			if(1==1 || pitem["userType"]==50){//显身
				if(pitem["userType"]==50){//主播
						
						userArray.push("<li id='online_"+pitem["userid"]+"' tid='"+pitem["userid"]+"' title='"+decodeURIComponent(pitem["username"])+"' utype='"+pitem["userType"]+"' goodnum='"+pitem["goodnum"]+"' level='"+pitem["level"]+"' richlevel='"+pitem["richlevel"]+"' order='"+pitem["sortnum"]+"' onclick='UserListCtrl.chatPublic();'><img style='width:44px' class='tou_xiang' src='/passport/avatar.php?uid="+pitem["h"]+"&size=middle'/>");
					
				}else if(pitem["userType"]==5){//僵尸

					userArray.push("<li id='online_"+pitem["userid"]+"' tid='"+pitem["userid"]+"' title='"+decodeURIComponent(pitem["username"])+"' utype='"+pitem["userType"]+"' goodnum='"+pitem["goodnum"]+"' level='"+pitem["level"]+"' richlevel='"+pitem["richlevel"]+"' order='"+pitem["sortnum"]+"' onclick='UserListCtrl.chatPublic();'><img style='width:44px'  class='tou_xiang' src='/passport/avatar.php?uid="+pitem["h"]+"&size=middle'/>");
		
				}else{//富豪
					
					if(pitem["h"]==0)
					{

						pitem["h"] = "1";
						//根据UID获取UCUID
						
						
						//alert(pitem["userid"]);
						
						$.ajax({
							type:"get",
							url:"/index.php/Show/getucuid/uid/"+pitem["userid"],
							async:false,
							success:function(data)
							{
								userArray.push("<li id='online_"+pitem["userid"]+"' tid='"+pitem["userid"]+"' title='"+decodeURIComponent(pitem["username"])+"'  utype='"+pitem["userType"]+"' goodnum='"+pitem["goodnum"]+"' level='"+pitem["level"]+"' richlevel='"+pitem["richlevel"]+"' order='"+pitem["sortnum"]+"' onclick='UserListCtrl.chatPublic();'><img style='width:44px'  class='tou_xiang' src='/passport/avatar.php?uid="+data+"&size=middle'/>");
							}
						});
					}
					else
					{
						userArray.push("<li id='online_"+pitem["userid"]+"' tid='"+pitem["userid"]+"' title='"+decodeURIComponent(pitem["username"])+"'  utype='"+pitem["userType"]+"' goodnum='"+pitem["goodnum"]+"' level='"+pitem["level"]+"' richlevel='"+pitem["richlevel"]+"' order='"+pitem["sortnum"]+"' onclick='UserListCtrl.chatPublic();'><img style='width:44px'  class='tou_xiang' src='/passport/avatar.php?uid="+pitem["h"]+"&size=middle'/>");
					}
					
					

				}
				if(pitem["userType"]==5){ //游客僵尸
					
					userArray.push("<span id='tt_"+pitem["userid"]+"' style='width:53px; height:32px;position:absolute; left:70px;'></span><p><a>"+decodeURIComponent(pitem["username"])+"</a></p>");
				  
				}else{
					var actBadge=pitem["actBadge"],sbadges=""; //活动徽章
					if(actBadge!=""){sbadges=this.dealBadges(actBadge);}
					//if(pitem["userType"]==10 || pitem["userType"]==60){
					if(pitem["userType"]==10){ //巡管
						ptxt="<span class='props patrol'></span>";
						pcolor=" class='p'";
					}
					strOn1+=sbadges;
					if(pitem["userType"]==50){ //主播
						if(pitem["level"]>0){ //主播等级
							strOn1+=" <span class='star star"+pitem["level"]+"'></span>";	
						}
					}else{
						if(pitem["richlevel"]>0){
							//strOn1+=" <span class='cracy cra"+pitem["richlevel"]+"'></span>";
                                                        var sx = 0;
                                                        if(pitem['star']){
                                                            sx = pitem['star'];
                                                        }
                                                        
                                                        strOn1+="<img class='cracy cra"+pitem["richlevel"]+"' src='/Public/images/sx"+sx+".gif'>";//123456
						}
					}
					if(pitem["vip"]!=0){//VIP
						if(pitem["vip"]==1){strOn1+=" <span class='props vip1'></span>";}else if(pitem["vip"]==2){strOn1+=" <span class='props vip2'></span>";}
					}
					
					if(this.gnum(pitem["goodnum"])!=""){strOn1+=" <em"+pcolor+">"+pitem["goodnum"]+"</em>";}
					
					strOn2+=ptxt;
					if(pitem["sellm"]!=0){//代理标准
						strOn2+=" <img src=\"/Public/images/sell.gif\" width=\"35\" height=\"16\"/>";	
					}
					if(pitem["familyname"]!=""){//徽章
						strOn2+=" <span class=family>"+pitem["familyname"]+"</span>";
					}
					strOn2+=" <a"+pcolor+">"+decodeURIComponent(pitem["username"])+"</a>";//123456
                                        var ttstk = pitem["stk"]?pitem["stk"]:'';
//                                        if(ttstk==''){
//                                            strOn2+=" <a "+pcolor+">"+decodeURIComponent(pitem["username"])+"</a>";
//                                        }else{
//                                            strOn2+=" <a "+pcolor+">"+decodeURIComponent(pitem["username"])+"</a>";
////                                            var ncttime = new Date().getTime();
////                                            
////                                            var ti = lj.checkin(pitem["userid"]);
////                                            if(ti != -1){
////                                                tieTiaoArray[ti]=[pitem["userid"],parseInt(pitem["stke"])*1000+ncttime];
////                                            }else{
////                                                tieTiaoArray.push([pitem["userid"],parseInt(pitem["stke"])*1000+ncttime]);
////                                            }
//                                        }
                                        
                                        if(ttstk==''){
                                            strOn0+='<span id="tt_'+pitem["userid"]+'" style="width:53px; height:32px;position:absolute; left:70px;"></span>';
                                        }else{
                                            strOn0+='<span id="tt_'+pitem["userid"]+'" style="width:53px; height:32px;position:absolute; left:70px;"><img src="/Public/images/note/bandingImg/tt'+pitem['stk']+'.png"></span>';
                                        }
                                        userArray.push(strOn0);
					if(strOn2!=""){userArray.push('<p>'+strOn2+'</p>');}
					if(strOn1!=""){userArray.push('<p>'+strOn1+'</p>');}//123456
					
				}
				userArray.push("</li>");
				//在线观众 end
				if(pitem["userType"]==50){ //主播
					giftArray.push("<li><a href=\"javascript:void(0);\" onclick=\"GiftCtrl.setGift("+pitem["userid"]+",'"+decodeURIComponent(pitem["username"])+"');\"><span class=\"star star"+pitem["level"]+"\"></span>"+decodeURIComponent(pitem["username"])+"</a></li>");
					chatArray.push("<li><a href=\"javascript:void(0);\" onclick=\"GiftCtrl.setUser("+pitem["userid"]+",'"+decodeURIComponent(pitem["username"])+"');\"><span class=\"star star"+pitem["level"]+"\"></span>"+decodeURIComponent(pitem["username"])+"</a></li>");
				}
			}
                        var ttstk = pitem["stk"]?pitem["stk"]:'';//try{ console.log(pitem["userid"]+"stk..."+ttstk);}catch(e){ }
                        if(ttstk==''){
                            //strOn2+=" <a "+pcolor+">"+decodeURIComponent(pitem["username"])+"</a>";
                        }else{
                            //strOn2+=" <a "+pcolor+">"+decodeURIComponent(pitem["username"])+"</a>";
                            var ncttime = new Date().getTime();

                            var ti = lj.checkin(pitem["userid"]);
//                            try{ console.log("刷新用户列表...");}catch(e){ }
//                            try{ console.log("1贴条数组长度..."+tieTiaoArray.length);}catch(e){ }
                            if(ti != -1){//try{ console.log("贴条数组-1..."+ti);}catch(e){ }
                                //try{ console.log("tieTiaoArray"+ti+"*"+tieTiaoArray[ti]['userid']);}catch(e){ }
                                tieTiaoArray[ti]=[pitem["userid"],parseInt(pitem["stke"])*1000+ncttime,pitem['stk']];
                            }else{//try{ console.log("贴条数组ti..."+ti);}catch(e){ }
                                tieTiaoArray.push([pitem["userid"],parseInt(pitem["stke"])*1000+ncttime],pitem['stk']);
                            }
                            //try{ console.log("2贴条数组长度..."+tieTiaoArray.length);}catch(e){ }
                        }
		}
                
		var arrVisistor=this.arrVisitor; //visitor
		for(var key in arrVisistor)
		{
			vitem=arrVisistor[key];
			
			   userArray.push("<li id='online_"+vitem["userid"]+"' tid='"+vitem["userid"]+"' utype='"+vitem["userType"]+"' order='"+vitem["sortnum"]+"' richlevel=0 title='"+decodeURIComponent(vitem["username"])+"'><p><a>"+decodeURIComponent(vitem["username"])+"</a><img class='tou_xiang' style='width:44px' src='/passport/avatar.php?uid=&size=middle'/></p></li>");	

		}

		if(this.cntPeople > this.minCount && this.isAll==0) 
		{
			//userArracitey.push('<li onclick="JsInterface.getAllUser();" title="下一页" class="getuserall">点击更多 >> </li>')
		}
		
		$('#loading_online').remove();
		this.cntPeople = parseInt($('#lm2_2').find('cite').html())+this.cntPeople;
		
		$('#lm2_2').find('cite').html(this.cntPeople);
		$("#content2_2").append(userArray.join(""));
//		$('#content2_2').append("<li style='text-align:right;width:122px;'><a>游客"+this.guePeople+"人</a></li>");
		$('#gift_userlist').append(giftArray.join(""));
		$('#chat_userlist').append(chatArray.join(""));
                ttsi = setInterval("lj.checkTietiao()", 10000);
                
        
	},
	appchatManage:function(){
		var managerArray=[],mitem="";
		var arrManage=this.arrManage;
		for(var key in arrManage){//manage
			var strMin1="",strMin2="",ptxt="",pcolor="";
			mitem=arrManage[key];
			if(1==1 || mitem["userType"]==50){//显身
				
				managerArray.push('<li id="manage_'+mitem["userid"]+'" tid="'+mitem["userid"]+'" onclick="UserListCtrl.chatPublic();" utype="'+mitem["userType"]+'"  level="'+mitem["level"]+'" goodnum="'+mitem["goodnum"]+'" richlevel="'+mitem["richlevel"]+'" order="'+mitem["sortnum"]+'" title="'+decodeURIComponent(mitem["username"])+'"><img style="width:44px" class="tou_xiang" src="/passport/avatar.php?uid='+mitem["h"]+'"&size="middle"/>');
				var actBadge=mitem["actBadge"],sbadges=""; //活动徽章
				if(actBadge!=""){sbadges=this.dealBadges(actBadge);}
				if(mitem["userType"]==10){ //巡管
					ptxt="<span class='props patrol'></span>";
					pcolor=" class='p'";
				}
				strMin1+=sbadges;
				if(mitem["richlevel"]>0){ //富豪等级
					strMin1+=" <span class='cracy cra"+mitem["richlevel"]+"'></span>";	
				}
				if(mitem["vip"]!=0){//VIP
					if(mitem["vip"]==1){strMin1+=" <span class='props vip1'></span>";}else if(mitem["vip"]==2){strMin1+=" <span class='props vip2'></span>";}
				}
				if(this.gnum(mitem["goodnum"])!=""){strMin1+=" <em"+pcolor+">"+mitem["goodnum"]+"</em>";}
				strMin2+=ptxt;
				if(mitem["sellm"]!=0){//代理标准
					strMin2+=" <img src=\"/Public/images/sell.gif\" width=\"35\" height=\"16\"/>";	
				}
				
				if(mitem["familyname"]!=""){//徽章
					strMin2+=" <span class=family>"+mitem["familyname"]+"</span>";	
				}
				strMin2+=" <a"+pcolor+">"+decodeURIComponent(mitem["username"])+"</a>";
				if(strMin1!=""){managerArray.push('<p>'+strMin1+'</p>');}
				if(strMin2!=""){managerArray.push('<p>'+strMin2+'</p>');}
				managerArray.push('</li>');
			}
		}
		this.cntManage = parseInt($('#lm2_1').find('cite').html())+this.cntManage;
		$('#loading_manage').remove();
		$('#lm2_1').find('cite').html(this.cntManage);
		$("#content2_1").append(managerArray.join(""));
	}
	,gnum:function(gn){
		var goodnum=gn;
		var gnbuy="";
		if(goodnum!="" && goodnum.length<10){ //is buy goodnum
		   gnbuy=goodnum;
		}
		return gnbuy;
	}
}
