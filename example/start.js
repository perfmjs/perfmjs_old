/**
 * config.js
 * @overview:搜索环境和参数配置
 * @date: 2012-11-30
*/
!(function($) {
	perfmjs.utils.namespace('perfmjs.app.config');
	perfmjs.app.config.lazymodule = {
		lazymodule1:{
			js: ['/perfmjs/js/example/lazyloadmodule1.js'],
			css:['http://s.no100.com/css/app/search/v4.0/core/example/lazyloadmodule1.css']
		},
		//这里示例了一个延迟加载模块有多种展现模式时的文件定义方式（魔方项目）
		lazymodule2:{
			combine1:{
				js: ['/perfmjs/js/example/lazyloadmodule2.js'],
				css:['http://s.no100.com/css/app/search/v4.0/core/example/lazyloadmodule21.css']
			},
			combine2:{
				js: ['/perfmjs/js/example/lazyloadmodule2.js'],
				css:['http://s.no100.com/css/app/search/v4.0/core/example/lazyloadmodule22.css']
			},
			combine3:{
				js: ['/perfmjs/js/example/lazyloadmodule2.js'],
				css:['http://s.no100.com/css/app/search/v4.0/core/example/lazyloadmodule33.css']
			}
		},
		lazymodule3:{
			js: ['/perfmjs/js/example/lazyloadmodule3.js'],
			css:['http://s.no100.com/css/app/search/v4.0/core/example/lazyloadmodule3.css']
		},
		bigrender1:{
			combine1:{
				js: ['/perfmjs/js/example/bigrender1.js'],
				css:['http://s.no100.com/css/app/search/v4.0/core/example/bigrender1.css']
			}
		},
		end:0
	};
	perfmjs.app.config.events={
		DELETE:"module1/delete",
		end:0
	};
})(window);

/**
 * 模块加载管理类，负责所有模块的注册及应用程序的初始化入口。
 * 模块的加载分为三类：
 * 1） 页面load时就需要被加载，并需要立即执行初始化的模块。									-- 首屏加载模块(NormalModule)
 * 2） 页面load时就需要被加载，但不需要立即执行初始化，而是后期通过事件驱动才初始化的模块。 -- 延迟初始化模块(LazyInitModule)
 * 3） 页面load完成后，通过事件驱动加载的模块，譬如 曝光事件，click事件、mouseover事件等。  -- 延迟加载模块(LazyLoadModule)
 * 
 * 以上三种模块都在此类中统一定义管理，注册和初始化的触发在此类中完成。
 * date:2012.11.30
 */
!(function($) {
	$.base("base.start", {
		init: function() {
			app.newInstance();
			this.firstViewModuleInit();
			this.lazyLoadModuleInit();
			this.lazyInitModuleInit();
			return this;
		},
		
		/**
		* 所有的普通模块的注册及初始化操作定义在此函数中。
		* 默认情况下，普通模块注册时并不会自动初始化。若想改变默认值，则config中添加{init:true}参数
		*/
		firstViewModuleInit:function(){
			app.instance.register("module1", "module1");
			app.instance.register("module2", "module2", {callback:function(){
//				/alert('started base.module2');
			}});
			app.instance.register("module3", "module3");
			app.instance.startAll();
		},
		
		/**
		* 所有的延迟加载模块的注册及初始化操作定义在此函数中。
		* a. 默认情况下，延迟加载|初始化模块注册时会自动调用模块的初始化函数，若想改变默认值，则config中添加{init:false}参数
		* b. 当多个元素注册为同一模块的触发元素时，application core可以控制只加载一次模块，并及时移除事件。
		* c. 请保持统一的注册方式，具体的业务逻辑请放入到相应模块中，此处只负责加载和初始化。
		*/
		lazyLoadModuleInit:function(){
			app.instance.lazyRegister("lazyloadmodule1", "lazyloadmodule1", 
				jquip(".domDetail"), 'exposure', {
				threshold:200,
				module:this.options.lazyurl.lazymodule1
			});
			app.instance.lazyRegister("lazyloadmodule2", "lazyloadmodule2",
			   '#lazyloadmodule2', 'mouseover', {
				module:this.options.lazyurl.lazymodule2
			});
			//对于一些异步创建的节点，页面初始化的时候是无法注册事件的。因此提供了一种使用代码触发
			//的模块注册方式。在触发的模块代码中调用sandbox.instance.notify("perfmjs.lazyload", {moduleId:"id***"})即可触发模块加载;
			app.instance.lazyRegister("lazyloadmodule3", "lazyloadmodule3", 
				null, 'manual',{
				module:this.options.lazyurl.lazymodule3
			});
			
			//bigRender优化方案，原理请参考 http://lifesinger.wordpress.com/2011/09/23/bigrender-for-taobao-item/
			 app.instance.lazyRegister("bigrender1", "bigrender1", 
				"#bigrender1", 'exposure',{
				threshold:200,
				module:this.options.lazyurl.bigrender1
			});
		},
		
		/**
		* 所有的延迟初始化载模块的注册及初始化操作定义在此函数中。
		* a. 默认情况下，延迟加载|初始化模块注册时会自动调用模块的初始化函数，若想改变默认值，则config中添加{init:false}参数
		* b. 当多个元素注册为同一模块的触发元素时，application core可以控制只加载一次模块，并及时移除事件。
		* c. 请保持统一的注册方式，具体的业务逻辑请放入到相应模块中，此处只负责加载和初始化。
		*/
		lazyInitModuleInit:function() {
			app.instance.lazyRegister("lazyinitmodule", "lazyinitmodule", '#delayInitBtn', 'click');
			//演示如何注册非模块的回调函数， 需要传入callback参数。 如果希望不移除驱动事件，则添加keep=true参数。
			app.instance.lazyRegister("mod-search-lazyinit2", null, jquip('#content img[lazyload-src]'), 'exposure', {
				keep:true,
				callback:function(el){
					src = jquip(el).attr('lazyload-src');
					if(src){
						jquip(el).attr('src',src);
						jquip(el).removeAttr('lazyload-src');
					}
				}
			});
		},
		end:0
	}, $.base.prototype, $.base.defaults);
	$.base.start.defaults = {
		lazyurl: perfmjs.app.config.lazymodule,
		scope: 'singleton',
		end: 0
	};
	
	//整个应用的入口函数
	perfmjs.loadres.ready(function() {
		start.newInstance();
	});
})(window);
