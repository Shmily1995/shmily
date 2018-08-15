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
_show.enterChat = 1;
////////////////////////////////////////////////////////////////////////////////////


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
	   //console.log(data);
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
		}
		
   }
	
}
$(function(){
	///////////////////////////////////////////////////////////////////////////////////
	/*客户端广播接收*/
	/*客户端监听用户连接事件广播*/

	socket.on('Conn',function(data){
		users = data;
		JsInterface.chatFromSocket(data);
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
		setTimeout(function(){
			JsInterface.chatFromSocket(data);
		}, 1000);
	});
	socket.on('onUserdisconnect',function(data){
		var userinfo_json = evalJSON(data);
		console.log(userinfo_json);
		//JsInterface.remove(data);
	});
	wlSocket.nodejsInit();
});
window.onload = function(){
	
 
	///////////////////////////////////////////////////////////////////////////////////
	/*客户端广播接收*/
	/*客户端监听用户连接事件广播*/

	// socket.on('Conn',function(data){
	// 	users = data;
	// 	JsInterface.chatFromSocket(data);
	// });
	// /*客户端监听禁言广播*/
	// socket.on('Shutup',function(data){
	// 	shutupuser = data;
	// });
	// 客户端监听消息广播
	// socket.on('showmsg',function(data){  

	// 	JsInterface.chatFromSocket(data);
	// });
	// /*客户端监听用户加入广播*/
	// socket.on('join',function(data){
	// 	var userinfo_json = evalJSON(data);
	// 	//console.log(userinfo_json)
	// 	setTimeout(function(){
	// 		JsInterface.chatFromSocket(data);
	// 	}, 1000);
	// });
	wlSocket.nodejsInit();
}

