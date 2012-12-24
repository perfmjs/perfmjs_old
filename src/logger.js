 /**
 * 日志模块
 * 1）允许定义日志等级 -- "error", "warn", "info", "debug", "log"
 * 2）在Firefox中通过firebug控制台输出日志，在IE中通过在url中添加debug=true参数，将日志显示在页面底部。
 * 3）线上模式的错误日志，将记录到draggon监控系统，触发报警。
 * @date 2012-11-30
 * import utils.js
 */
!(function($){
	
	perfmjs.logger=function(){};
	perfmjs.logger.level=4; 	//default level
	perfmjs.logger.errorUri="http://s.no100.com/rpc/dragoontrack/logError.json?msg="; 	//dragoon url
	perfmjs.logger.setLevel=function(level){//set logger level to filter the logger , so just show the logger level you focus.
		perfmjs.logger.level=level;
	};
   
	var prepared = false;
	var methods = [ "error", "warn", "info", "debug", "log"];//0-4 level
   
	perfmjs.utils.extend(perfmjs.logger.prototype, {
		level:perfmjs.logger.level,
		setEnableLevel: function(level) {
			if(level>4 || level<0) {
				this.error(['wrong level setting. level should be 0-4, the int type,you set ',level,", so stupided."].join(''));
			}
			this.level=parseInt(level);
		},
		enabled: function(lev) {
			if(lev>perfmjs.logger.level) {
				return false;
			}
			return true;
		},
		name: function() {
			return this._name;
		},
		log: function() {
			this._log(4, arguments);
		},
		debug: function() {
			this._log(3, arguments);
		},
		info: function() {
			this._log(2, arguments);
		},
		warn: function() {
			this._log(1, arguments);
		},
		error: function() {
			this._log(0, arguments);
		},
		_handler: function(level, name, msg){
			var method=methods[level];
			msg=[[method+"|"].join(" | ")].concat(Array.prototype.slice.call(msg));
			   
			if(self.console && !perfmjs.browser.msie()){
			   if(console.log.apply){
				  console[method].apply(console, msg);    	  
			   }else{
				  console[console[method]?method:'log'](msg);
			   }
			}else{
				//在IE下，如果url中添加debug=true，则日志窗口将被添加在页面的底部，帮助调试。
				if(perfmjs.browser.msie()){
					if(/debug=true/i.test(location.search)){
						!prepared && this._prepare();	
						var msgBox = jquip('#DEBUG ol');
						
						var color;
						switch(method){
							case "log":{
								color="#FFFFFF";
								break;
							}
							case "debug":{
								color="#C0C0C0";
								break;
							}
							case "info":{
								color="#EBF5FF";
								break;
							}
							case "warn":{
								color="#FFFFC8";
								break;
							}
							case "error":{
								color="#FE6947";
								break;
							}
							default:{
								color="#FFFFFF";
								break;
							}
						}
						jquip('<li style="background-color:'+ color +';">').text('' + msg).appendTo(msgBox);				
					} 
				}
			}
			//online模式下需要报警
			if(!DEBUG_MOD){
				if(level == 0 || level == 1){
					(new Image()).src = perfmjs.logger.errorUri + this._getBrowserInfo() + msg;
				}
			}
		},
	 
		_log: function(level, msg) {
			if (this.enabled(level)) {
				this._handler(level,this.name(),msg);
			}
		},
	
		_getBrowserInfo:function(){
			return prfmjs.browser.info();
		},
	
		_prepare:function(){
			jquip('#DEBUG').remove();
			jquip(document.body).append('<div id="DEBUG" style="margin-top:10px;padding:8px;border:dashed 1px #FF7300;background-color:#EEE;color:#000;"><ol></ol></div>');
			prepared = true;
		},
		end:0
	});
   
	var logs={};//logs  instance container
	perfmjs.logger = function(name) {
       if (!logs[name]) {
           logs[name] = new perfmjs.logger(name);
           logs[name]._name=name;
       }
       return logs[name];
	}('perfmjs');
	if(DEBUG_MOD){
		perfmjs.logger.setEnableLevel(4);	
	}else{
		perfmjs.logger.setEnableLevel(2);
	}
	//try-catch 捕捉不到的异常使用onerror函数来记录日志
	/* window.onerror = function(msg,url,line){
		if(!DEBUG_MOD){
			(new Image()).src = perfmjs.logger.errorUri + perfmjs.logger._getBrowserInfo() + msg + ' |url:' +url + ' |line:'+line;
		}
		return false;
	}; */
})(window);