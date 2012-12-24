/**
 * 数据模块懒加载类：应用中有一些功能模块并不是在页面初始化的时候就加载的，
 * 它们是在页面节点曝光时或是触发了某些页面事件时才需要被加载。该类完成的就是
 * 对此类模块延迟加载功能的实现，便于使用并提升站点性能。
 * date:2012.11.30
 * import gears.js
 */
!(function($) {
	$.base("base.lazymodule", {
		init: function(sb) {
			var self = this;
			sb.on("perfmjs.lazyload", function(msg) {
				self._handleManualEvent(msg);
			});
			return this;
		},
		
		/**
		 * @param  els 触发延迟加载模块的元素，可以是id、dom、domArray(jquery dom数组对象) {string|object|array}
		 * @param: event 延迟加载的驱动事件，可以是曝光事件、dom事件、manual事件。{exposure|manual|dom events like: click, mouseover, focus, mouseenter}
		 * @param: cfg (optional)配置延迟加载的参数，例如对应的threshold等{Object}
		 * @param: callback (optional)延迟加载成功后的回调函数{Object}
		*/
		register:function(els, event, cfg, callback) {
			var config = perfmjs.utils.extend(true, {}, cfg);
			if(els){
				var doms = jquip(els);
				if(!doms || doms.length==0 || !event){
					return false;
				}
				if(event === "exposure") {
					this._handleExposureEvent(doms, config, callback);
				} else {
					var self = this;
					var handle = function(e) {
						self._getModule(this, config, callback, event);
						doms.unbind(event, handle);
					};
					doms.bind(event, handle);
				}
			} else {
				if(event === "manual"){
					this.options['manualPool'][config.key] = [config, callback];
				}
			}
			return true;
		 },
		
		/**
		 * 处理曝光延迟加载的模块
		 */
		_handleExposureEvent:function(doms, cfg, callback){		
			var els = this._pushToArray(doms, cfg, callback);
			this._uniqueMerge(this.options['exposurePool'],els);		
			if(!this.options['hasBind']){
				this.options['viewportHeight'] = this._getViewportHeight();
				this._bindExposureEvent();
			}
			this._loadModules();
		},
		
		
		/**
		 * 处理manual触发的延迟加载模块
		 */
		_handleManualEvent:function(msg){		
			if(msg.moduleId){
				var stack = this.options['manualPool'][msg.moduleId];
				if(stack){
					this._getModule(null, stack[0], stack[1]);
					delete this.options['manualPool'][msg.moduleId];
				}
			}
		},
		
		/**
		 * 将元素及对应的callback和config先push到数组中
		 */
		_pushToArray:function(els, cfg, fn){
			var arr = [];
			if(!els.length){
				return arr;
			}
			for(var i=0;i<els.length;i++){
				arr.push([els[i], cfg, fn]);
			}
			return arr;
		},
		
		/**
		 * 合并数组，去除重复项。
		 */
		_uniqueMerge:function(des,a){
			for(var i=0;i<a.length;i++){
				for(var j=0,len=des.length;j<len;j++){
					if(a[i] === des[j]){
						a.splice(i,1);
						break;
					}
				}
			}
			perfmjs.utils.merge(des,a);
		},
		

		/**
		 * 绑定曝光事件，元素在页面上曝光时，事件触发
		 */
		_bindExposureEvent:function(){
			if(this.options['hasBind']){
				return;
			}
			var self = this;
			this.options['docBody'].bind('scroll.lazymodule', function(e){
				self._exposureCall(self._loadModules, self);
			}); 
			this.options['docBody'].bind('resize.lazymodule', function(e){
				self.options['viewportHeight'] = self._getViewportHeight();
				self._exposureCall(self._loadModules, self);
			});
			this.options['hasBind'] = true;
		},
		
		/**
		 * 移除曝光事件
		 */
		_removeEvent:function(){
			if(!this.options['hasBind']){
				return;
			}
			this.options['docBody'].unbind('scroll.lazymodule');
			this.options['docBody'].unbind('resize.lazymodule');
			this.options['hasBind'] = false;
		},
					
		/**
		 * 加载函数
		 */
		_exposureCall:function(method, context){
			clearTimeout(method.tId);
			method.tId = setTimeout(function(){
				method.call(context);
			},100);
		},
		
		/**
		 * 加载曝光模块
		 */
		_loadModules:function(){
			this._filter(this.options['exposurePool'], this._runCallback, this);
			//如果已无模块需要延迟加载，则移除曝光事件
			if(this.options['exposurePool'].length===0){
				this._removeEvent();
			}
		},
	
		 /**
		 * 遍历资源数组，满足加载条件的曝光模块执行加载，并从数组中移除
		 */
		_filter:function(array, method, context){
			var item;
			for(var i=0;i<array.length;) {
				item = array[i];
				if(perfmjs.utils.isArray(item) && this._checkPosition(item)){
					array.splice(i, 1);
					method.call(context,item);
					
					//防止同一模块被重复加载
					if(!item[1].keep){
						var moduleId = item[1].key;
						for(var j=0; j<array.length;){	
							var ele = array[j];
							if(moduleId === ele[1].key ){
								array.splice(j, 1);
							} else {
								j++;
							}
						}
					}
				} else {
					i++;
				}
			}
		},
		
		/*
		 * 执行回调函数
		 */
		_runCallback:function(arr){
			var el,fn,cfg;
			el 	= arr[0];
			cfg = arr[1];
			fn 	= arr[2];
			this._getModule(el, cfg, fn);
		},
		
		_getModule:function(el, cfg, fn, event){
			var self = this;
			var module = cfg.module;
			if(module){
				for (var i = 0; i < module.css.length; i++) {
					perfmjs.includeres.writecss(module.css[i]);
				}
				if (fn) {
					perfmjs.loadres.js(module.js, function() {
						fn(el);
						if (event) {
							self._dispatchEvent(el, event);
						}
					});
				} else {
					perfmjs.loadres.js(module.js);
				}
			} else {
				if(fn){
					fn(el);
				}
			}
		},
		
		/**
		 * 获取当前视窗高度
		 */
		_getViewportHeight:function(){
			return this.options['docBody'].height();
		},
		
		/**
		 * 判断元素是否已经到了可以加载的地方
		 */
		_checkPosition: function(el){
			var ret = false;
			var threshold = el[1].threshold ? el[1].threshold : this.options['threshold'];
			var currentScrollTop = jquip(document).scrollTop();
			var benchmark = currentScrollTop + this.options['viewportHeight'] + threshold;

			var currentOffsetTop = (jquip(el).css("display")!=='none') ? jquip(el).offset().top : Number.POSITIVE_INFINITY;
			if(currentOffsetTop <= benchmark){
				ret = true;
			}
			return ret;
		},
		
		_dispatchEvent:function(dom, evt){
			try{
				 if( document.createEvent ){
					var evObj = document.createEvent('MouseEvents');
					evObj.initEvent(evt, true, false );
					dom.dispatchEvent(evObj);
				} else if( document.createEventObject ) {
					dom.fireEvent('on'+evt);
				}
				return true;
			}
			catch(e){
				return false;
			}
		},
		end:0
	});
	$.base.lazymodule.defaults = {
		threshold: 250,
		hasBind: false,
		docBody: jquip(window),
		viewportHeight: 0,
		exposurePool: [],
		manualPool: {}
	};
})(window);