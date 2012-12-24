!(function($) {
	$.ajax = function(options) {
		options = {
			method:		options.method || "GET",			//HTTP请求类型，默认为GET；
			url:		options.url || "",					//URL请求地址；
			timeout: 	options.timeout || 8000,			//请求超时时间，默认是8秒；
			data:		options.data || "",					//服务器返回的数据类型；（xml，script，html），默认为空即html；
			params:		options.params || "",				//"POST"方法发送数据时所传递的参数；
			onComplete: options.onComplete || function(){},	//请求完成时执行的函数；
			onError:	options.onError || function(){},	//请求失败时执行的函数；
			onSuccess:	options.onSuccess || function(jsonMessage){},	//请求成功时调用的函数；
			onLoading:	options.onLoading || function(){ }	//请求过程中调用的函数；
		};
		//创建请求对象xReq；
		if(window.XMLHttpRequest){
			var xReq = new XMLHttpRequest();	//如果支持标准的创建xmlhttpRequest对象的话之间创建(Firefox,Safari等大多数浏览器)；
		}else if(window.ActiveXObject){
			var xReq = new ActiveXObject("Microsoft.XMLHTTP");	//IE下创建对应的xmlhttp对象；
		};
		//记录请求是否成功完成；
		var requestDone = false;
		//初始化一个N秒后执行的回调函数，用于当N秒后未完成的话取消请求；
		setTimeout(function(){
			requestDone = true;
		},options.timeout);
		
		if(options.method = "GET"){
			xReq.open(options.method,options.url+serialize(options.params),true);		//初始化请求；
			xReq.onreadystatechange = readyStateChange;		//建立回调函数；
			xReq.send();									//发送请求；
		}else if (options.method=="POST"){
			xReq.open(options.method,options.url,true);		//初始化请求；
			xReq.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
			if(xReq.overrideMimeType){	//保证浏览器发送的串行化数据长度正确；
				xReq.setRequestHeader("Connection","close");
			};
			xReq.onreadystatechange = readyStateChange;		//建立回调函数；
			xReq.send(options.params);						//带参数发送请求；
		};
		
		//建立回调函数,监听文档的变化；
		function readyStateChange(){		
			//在状态改变并且请求未超时的情况下回调；
			if(xReq.readyState == 4 && !requestDone) {	//如果请求成功；
				var jsonMessage = $.utils.formatJSONMessage(httpResData(xReq,options.method));
				if (httpReqSuccess(xReq)){
					options.onSuccess(jsonMessage);
				} else if(!requestDone){			//如果还在请求过程中；
					options.onLoading();
				} else {	//如果发生了错误则执行错误处理函数；
					options.onError();
				};
				//调用完成的回调函数；
				options.onComplete();
				//最后清除对象；
				xReq = null;
			}	
		};
		
		//判断http响应是否成功；
		function httpReqSuccess(r){
			try{
				//如果得不到服务状态同时请求的为本地文件则认为请求成功；
				return !r.status && location.protocol == "file:" ||
				// 所有200-300之间的状态码都表示成功；
				( r.status >= 200 && r.status < 300 ) ||
				// 如果文档没有被修改也表示请求成功；
				r.status == 304 ||
				// Safari在文档未修改时返回空状态；
				FUB.isSafari && typeof r.status == "undefined";			
			}catch(e){}		//如果发生错误，则往下进行认为请求失败；
			//如果状态检查失败，则假定请求时失败的；
			return false;
		};
		
		//从响应中解析数据；
		function httpResData(r,method) {
			// 获取content-type头部信息;
			var ct = r.getResponseHeader("content-type");
			// 如果没有提供默认的类型，判断服务器是否返回XML形式；
			var data = ct && ct.indexOf("xml") >= 0;
			// 若干是则返回xml对象，否则返回文本内容；
			data =  (options.data == "xml" || data )? r.responseXML : r.responseText;
			// 如果指定返回类型是script,则返回json格式的内容；
			if ( options.data == "script" ){
				if(window.execScript){
					window.execScript(data);
				}else{
					eval.call( window, data );
				}
				
			};
			// 返回数据；
			return data;
		};
		
		//串行化数据；
		function serialize(a) {
			if(!a){		//如果没有请求参数，直接返回；
				return "";
			}
			// 定义串行化结果的集合；
			var s = [];
			// 如果传入的参数是数组，假定他们是表单元素的数组；
			if ( a.constructor == Array ) {
				// 串行化表单元素；
				for ( var i = 0; i < a.length; i++ )
					s.push( a[i].name + "=" + encodeURIComponent( a[i].value ) 
				);
			} else {
			// 串行化键/值对对象；
			for (var j in a) {
					s.push(j + "=" + encodeURIComponent(a[j]));
				};
			};
			// 返回串行化的结果；
			return "?"+s.join("&");
		};
	};
})(perfmjs);
perfmjs.ajax({
	url: '/rest/test/a',
	onError: function(jsonMessage) {
		alert('ajax error');
		alert(jsonMessage['result']);
	},
	onSuccess: function(jsonMessage) {
		//alert(jsonMessage['result']['hello']['名称']);
	}
});