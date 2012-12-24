/**
 * 按模块加载加载应用所需的js和css文件
 * sources e.g. [{n:'common',f:'http://s.no100.com/perfmjs/js/core2/include-common.js',t:'js',m:'jq;dlt',d:'http://s.no100.com'}]
 * combineUrls e.g. []
 * import loadres.js
 */
var currentDomain = ""; //全局只取唯一值 　e.g. http://www.no100.com/uc
!(function($) {
	perfmjs.includeres.loadModules({name:'comm', type:'css', mdCallback:function(source, module, combineUrls){
		if (source['d'] !== undefined && currentDomain === '') {
			currentDomain = source['d'];
		}
		//按模块加载资源文件
		if (module === 'jq') {
			combineUrls[combineUrls.length] = "http://s.no100.com/perfmjs/css/common/common.css?v=20121204001";
		}
	}});
	perfmjs.includeres.loadModules({name:'comm', type:'js', mdCallback:function(source, module, combineUrls){
		if (source['d'] !== undefined && currentDomain === '') {
			currentDomain = source['d'];
		}
		//按模块加载资源文件
		if (module === 'app') {
			//装载应用需要的资源
			combineUrls[combineUrls.length] = 'example/module1.js';
			combineUrls[combineUrls.length] = 'example/module2.js';
			combineUrls[combineUrls.length] = 'example/module3.js';
			combineUrls[combineUrls.length] = 'example/lazyinitmodule.js';
			combineUrls[combineUrls.length] = 'start.js';
		}
	}});
})(window);