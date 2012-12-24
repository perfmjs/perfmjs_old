/**
 * ajax请求插件
 */
!(function($) {
	perfmjs.utils.namespace('perfmjs.ajaxcall');
	/*
	 * invoke as: 
		$(this).syncAjaxRequest(function(jsonMessage) {
			if (jsonMessage.status == 'success') {
				//do something using jsonMessage.result
			} else {
				alert("获取xx数据失败!" + jsonMessage.msg);
			}
		}, 'url address');*/
	perfmjs.ajaxcall.syncAjax = function(callback, url, urlParams, ajaxType, cache) {
		perfmjs.ajaxcall.syncAjaxRequest(url, function(responseText) {
			callback.call(this, perfmjs.ajaxcall.formatJSONMessage(responseText));
		}, urlParams, ajaxType, cache);
	};
	//跨域ajax请求
	perfmjs.ajaxcall.getjsonp = function(callback, url, data, remoteCallbackVar) {
		remoteCallbackVar = remoteCallbackVar || 'callback';
		if (url.indexOf('?')>=0) {
			url = url + "&" + remoteCallbackVar + "=?";
		} else {
			url = url + "?" + remoteCallbackVar + "=?";
		}
		return jQuery.getJSON(url, data, callback);
	};
	perfmjs.ajaxcall.asyncAjaxRequest = function(url, callback, data, type, cache) {
		if (cache == undefined) cache = true;
		jQuery.ajax({
		    url: url,
		    data: data,
		    cache : cache, 
		    async : true,
		    timeout: 20000, //default20000毫秒
		    type : type || "GET",
		    dataType : 'json/xml/html',
		    success : callback,
		    error: function(data) {
				alert('由于网络原因,以致未能成功处理异步ajax请求!');
		    }
		});		
	};
	perfmjs.ajaxcall.syncAjaxRequest = function(url, callback, data, type, cache) {
		if (cache == undefined) cache = true;
		jQuery.ajax({
		    url: url,
		    data: data,
		    //cache : cache, 
		    //async : false,
		    //timeout: 20000, //default20000毫秒
		    type : type || "GET",
		    dataType : 'json/xml/html',
		    success : callback,
		    error: function(data) {
				alert('由于网络原因,以致未能成功处理同步ajax请求!');
		    }
		});		
	};
	perfmjs.ajaxcall.get = function(callback, url , data) {
		jQuery.get(url, data, callback, "json");
	};
})(window);