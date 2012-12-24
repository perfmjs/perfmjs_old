/**
 * 以下是实现javascript文件无阻塞加载的类，修改自head.js源码：http://headjs.com/  v0.96版本
 * 完成javascript资源文件的无阻塞加载和执行，用以降低页面初始的load时间，已经过线上严格测试，无特殊情况，不要改动。
 * 调用方法：
    perfmjs.loadres.js("http://www.no100.com/js/app/search/v4.0/module/base/searchweb.js",
							   "http://www.no100.com/js/app/search/v4.0/example/config.js",
							   "http://www.no100.com/js/app/search/v4.0/example/module1.js",
							   "http://www.no100.com/js/app/search/v4.0/example/app.start.js");
 * import joquery.js
 * import utils.js
 */
!(function(doc) {
    var head = doc.documentElement,
        isHeadReady,
        isDomReady,
        domWaiters = [],
        queue = [],        // waiters for the "head ready" event
        handlers = {},     // user functions waiting for events
        scripts = {};      // loadable scripts in different states
    var api = perfmjs.loadres = (perfmjs.loadres || function() {api.ready.apply(null, arguments);});
    // states
    var PRELOADED = 1,
        PRELOADING = 2,
        LOADING = 3,
        LOADED = 4;
    isAsync = doc.createElement("script").async === true || "MozAppearance" in doc.documentElement.style || window.opera;
    if (isAsync) {
    	//Method 1: simply load and let browser take care of ordering
	    api.js = function() {
	        var args = arguments,
	             fn = args[args.length -1],
	             els = {};
	        if (!isFunc(fn)) { fn = null; }
	        each(args, function(el, i) {
	        	if (perfmjs.utils.isArray(el)) {
	        		//处理第一个参数是资源文件地址数组的情况
	        		var _el = el;
	        		var elen = _el.length;
	        		for (var ii = 0; ii < elen; ii++) {
	                    el = getScript(_el[ii]);
	                    els[el.name] = el;
	                    load(el, fn && i == args.length -2 ? function() {
	                        if (allLoaded(els)) { one(fn); }
	                    } : null);
	        		}
	        	} else if (el != fn) {
	                el = getScript(el);
	                els[el.name] = el;
	                load(el, fn && i == args.length -2 ? function() {
	                    if (allLoaded(els)) { one(fn); }
	
	                } : null);
	            }
	        });
	        return api;
	    };
    } else {
    	// Method 2: preload with text/cache hack
    	api.js = function() {
            var args = arguments,
                rest = [].slice.call(args, 1),
                next = rest[0];
            // wait for a while. immediate execution causes some browsers to ignore caching
            if (!isHeadReady) {
                queue.push(function()  {
                    api.js.apply(null, args);
                });
                return api;
            }
            // multiple arguments
            if (next) {
                // load
                each(rest, function(el) {
                    if (!isFunc(el)) {
                        preload(getScript(el));
                    }
                });
                // execute
                load(getScript(args[0]), isFunc(next) ? next : function() {
                    api.js.apply(null, rest);
                });
            // single script
            } else {
            	if (perfmjs.utils.isArray(args[0])) {
                	//处理第一个参数是资源文件地址数组的情况
            		var _el = args[0];
            		var elen = _el.length;
            		for (var ee = 0; ee < elen; ee++) {
                        load(getScript(_el[ee]));	
            		}
            	} else {
            		load(getScript(args[0]));
            	}
            }
            return api;
        };
    }
    api.ready = function(key, fn) {
        // DOM ready check: head.ready(document, function() {});
        if (key == doc) {
            if (isDomReady) { one(fn);  }
            else { domWaiters.push(fn); }
            return api;
        }
        // shift arguments
        if (isFunc(key)) {
            fn = key;
            key = "ALL";
        }    
        // make sure arguments are sane
        if (typeof key != 'string' || !isFunc(fn)) { return api; }
        
        var script = scripts[key];
        // script already loaded --> execute and return
        if (script && script.state == LOADED || key == 'ALL' && allLoaded() && isDomReady) {
            one(fn);
            return api;
        }
        var arr = handlers[key];
        if (!arr) { arr = handlers[key] = [fn]; } else { arr.push(fn); }
        return api;
    };
    // perform this when DOM is ready
    api.ready(doc, function() {
        if (allLoaded()) {
            each(handlers.ALL, function(fn) {
                one(fn);
            });
        }
        if (api.feature) {
            api.feature("domloaded", true);
        }
    });


    /*** private functions ***/
    // call function once
    function one(fn) {
        if (fn._done) { return; }
        fn();
        fn._done = 1;
    }
    function toLabel(url) {
        var els = url.split("/"),
             name = els[els.length -1],
             i = name.indexOf("?");
        return i != -1 ? name.substring(0, i) : name;
    }
    function getScript(url) {
        var script;
        if (typeof url == 'object') {
            for (var key in url) {
                if (url[key]) {
                    script = { name: key, url: url[key] };
                }
            }
        } else {
            script = { name: toLabel(url),  url: url };
        }
        var existing = scripts[script.name];
        if (existing && existing.url === script.url) { return existing; }
        scripts[script.name] = script;
        return script;
    }

    function each(arr, fn) {
        if (!arr) { return; }
        // arguments special type
        if (typeof arr == 'object') { arr = [].slice.call(arr); }
        // do the job
        for (var i = 0; i < arr.length; i++) {
            fn.call(arr, arr[i], i);
        }
    }

    function isFunc(el) {
        return Object.prototype.toString.call(el) == '[object Function]';
    }

    function allLoaded(els) {
        els = els || scripts;
        var loaded;        
        for (var name in els) {
            if (els.hasOwnProperty(name) && els[name].state != LOADED) { return false; }
            loaded = true;
        }
        return loaded;
    }

    function onPreload(script) {
        script.state = PRELOADED;
        each(script.onpreload, function(el) {
            el.call();
        });
    }

    function preload(script, callback) {
        if (script.state === undefined) {
            script.state = PRELOADING;
            script.onpreload = [];
            scriptTag({ src: script.url, type: 'cache'}, function()  {
                onPreload(script);
            });
        }
    }

    function load(script, callback) {
        if (script.state == LOADED) {
            return callback && callback();
        }
        if (script.state == LOADING) {
            return api.ready(script.name, callback);
        }
        if (script.state == PRELOADING) {
            return script.onpreload.push(function() {
                load(script, callback);
            });
        }
        script.state = LOADING;
        scriptTag(script.url, function() {
            script.state = LOADED;
            if (callback) { callback(); }
            // handlers for this script
            each(handlers[script.name], function(fn) {
                one(fn);
            });
            // everything ready
            if (allLoaded() && isDomReady) {
                each(handlers.ALL, function(fn) {
                    one(fn);
                });
            }
        });
    }
	
    function scriptTag(src, callback) {
        var s = doc.createElement('script');
        s.type = 'text/' + (src.type || 'javascript');
        s.src = src.src || src;
        s.async = false;
        s.onreadystatechange = s.onload = function() {
            var state = s.readyState;
            if (!callback.done && (!state || /loaded|complete/.test(state))) {
                callback.done = true;
                callback();
            }
        };
        // use body if available. more safe in IE
        (doc.body || head).appendChild(s);
    }

    /*
        The much desired DOM ready check
        Thanks to jQuery and http://javascript.nwbox.com/IEContentLoaded/
    */
    function fireReady() {
        if (!isDomReady) {
            isDomReady = true;
            each(domWaiters, function(fn) {
                one(fn);
            });
        }
    }
    // W3C
    if (window.addEventListener) {
        doc.addEventListener("DOMContentLoaded", fireReady, false);
        // fallback. this is always called
        window.addEventListener("load", fireReady, false);
    // IE
    } else if (window.attachEvent) {
        // for iframes
        doc.attachEvent("onreadystatechange", function()  {
            if (doc.readyState === "complete" ) {
                fireReady();
            }
        });
        // avoid frames with different domains issue
        var frameElement = 1;
        try {
            frameElement = window.frameElement;

        } catch(e) {}
        if (!frameElement && head.doScroll) {

            (function() {
                try {
                    head.doScroll("left");
                    fireReady();

                } catch(e) {
                    setTimeout(arguments.callee, 1);
                    return;
                }
            })();
        }
        // fallback
        window.attachEvent("onload", fireReady);
    }
    // enable document.readyState for Firefox <= 3.5
    if (!doc.readyState && doc.addEventListener) {
        doc.readyState = "loading";
        doc.addEventListener("DOMContentLoaded", handler = function () {
            doc.removeEventListener("DOMContentLoaded", handler, false);
            doc.readyState = "complete";
        }, false);
    }
    /*
        We wait for 300 ms before script loading starts. for some reason this is needed
        to make sure scripts are cached. Not sure why this happens yet. A case study:
        https://github.com/headjs/headjs/issues/closed#issue/83
    */
    setTimeout(function() {
        isHeadReady = true;
        each(queue, function(fn) { fn(); });
    }, 300);
})(document);
/**
 * 解析加载资源文件的url.
 * 如：
  	<script type="text/javascript" src="/perfmjs/js/core2/onlyforload.js?v=2012120303^{n:'comm',f:'',t:'css',m:'fb;jq',d:'http://s.no100.com'}"></script>
  	<script type="text/javascript" src="/perfmjs/js/core2/onlyforload.js?v=2012120301^{n:'ssq-comm',f:'http://s.no100.com/perfmjs/js/core2/include-comm.js',t:'js',m:'ssq',d:'http://s.no100.com'}"></script>
	<script type="text/javascript" src="/perfmjs/js/core2/onlyforload.js?v=2012120302^{n:'comm',f:'http://s.no100.com/perfmjs/js/core2/include-comm.js',t:'js',m:'jq;dlt',d:'http://s.no100.com'}"></script>
	<script type="text/javascript" src="/perfmjs/js/core2/jquery-1.8.3.js"></script>
	<script type="text/javascript" src="/perfmjs/js/core2/utils.js"></script>
	<script type="text/javascript" src="/perfmjs/js/core2/base.js"></script>
	<script type="text/javascript" src="/perfmjs/js/core2/json.js"></script>
	<script type="text/javascript" src="/perfmjs/js/core2/joquery.js"></script>
	<script type="text/javascript" src="/perfmjs/js/core2/loadres.js"></script>
	或者使用以下压缩地址
  	<script type="text/javascript" src="/perfmjs/js/core2/onlyforload.js?v=2012120303^{n:'comm',f:'',t:'css',m:'jq;fb',d:'http://s.no100.com'}"></script>
	<script type="text/javascript" src="/perfmjs/js/core2/onlyforload.js?v=2012120302^{n:'comm',f:'http://s.no100.com/perfmjs/js/core2/include-comm.js',t:'js',m:'jq;dlt',d:'http://s.no100.com'}"></script>
	<script type="text/javascript" src="/perfmjs/js/core2/core.min.js?v=2012120301^{n:'ssq-comm',f:'http://s.no100.com/perfmjs/js/core2/include-comm.js',t:'js',m:'ssq',d:'http://s.no100.com'}"></script>
 */
!(function($) {
	perfmjs.includeres = {
		writejs: function(src, encode) {
		    document.write('<script type="text/javascript" src='+src+' charset="'+(encode||"UTF-8")+'"></script>');
		},
		writecss: function(link) {
			//css最好要同步下载且放在head元素中
			//document.write('<link type="text/css" rel="stylesheet" href="' + link + '" />');    
			var cssNode = document.createElement('link');
			cssNode.type = 'text/css'; cssNode.rel = 'stylesheet'; cssNode.href = link;
			document.getElementsByTagName("head")[0].appendChild(cssNode);
		},
		load: function() {
			this._parseLoadedRes();
			var len = this.sources.length;
			var v = this.getVersion();
			var confs = [];
			for(var i = 0; i < len;  i++) {
				var option = this.sources[i];
				if (option['f'] != undefined && option['f'] != '') {
					confs[confs.length] = option['f'] + "?v=" + v;
				}
			}
			
			confs = joquery.newInstance(confs).distinct(function(item) {
				return item;
			}).toArray();
			//以下include文件用同步加载而不用异步加载方式:perfmjs.loadres.js(confs);
			var confLen = confs.length;
			for(var j = 0; j < confLen;  j++) {
				this.writejs(confs[j]);
			}
		},
		//加载应用需要的所有相关js或css文件
		loadModules: function(options) {
			options = perfmjs.utils.extend({name:'comm', type:'js', mdCallback:function(){}, handleUrlscallback:function(){}}, options);
			if (typeof perfmjs.includeres.sources != 'undefined') {
				var sources = perfmjs.includeres.sources;
				sources = joquery.newInstance(sources).select(function(item) {
					return (item['n'] === options['name'] && item['t'] === options['type']);
				}).toArray();
				var combineUrls = [];
				var modLen = sources.length;
				for (var i = 0; i < modLen; i++) {
					var source = sources[i];
					var modules = source['m'].split(";");
					var moduleslen = modules.length;
					for (var j = 0; j < moduleslen; j++) {
						var module = modules[j];
						options.mdCallback.call(null, source, module, combineUrls);
					}
				}
				//去掉重复链接文件名
				combineUrls = joquery.newInstance((options.handleUrlscallback.call(null, combineUrls)||combineUrls)).distinct(function(item) {return item;}).toArray();
				if (combineUrls.length > 0) {
					if (options.type === 'js') {
						//应用所需的js文件使用异步加载
						perfmjs.loadres.js(combineUrls);
					} else if (options.type === 'css') {
						//FIXME css文件应使用同步加载且应使用minify或concat之类的在线压缩工具
						var combineUrlsLen = combineUrls.length;
						for (var r = 0; r < combineUrlsLen; r++) {
							this.writecss(combineUrls[r]);
						}				
					}
				}
			}
		},
		sources: [],
		getVersion: function(interval) {
			interval = interval || 2;
			var load_date = new Date();
			var load_day = load_date.getDate()<=9?('0'+load_date.getDate()):load_date.getDate();
			var load_hour = load_date.getHours()<=9?('0'+load_date.getHours()):load_date.getHours();
			var _min = load_date.getMinutes()%2==0?load_date.getMinutes():(load_date.getMinutes()-load_date.getMinutes()%interval);
			var load_minute = _min<=9?('0'+_min):_min;
			return ''+load_date.getFullYear()+(load_date.getMonth()+1)+load_day+load_hour+load_minute;
		},
		_parseLoadedRes: function(loadfile) {
			//只认带有onlyforload.js或core.js或core.min.js或core-def.js字符的地址
			loadfile = loadfile || 'onlyforload.js|core.min.js|core.js|core-def.js';
			this.sources = [];
			var scripts = document.getElementsByTagName("script");
			for (var i=0; i< scripts.length; i++) {
				var src = scripts[i].src;
				var scriptOptions={};
				if (src && src.match(loadfile)) {
					if(src.indexOf('^') != -1) {
						var srcOptions = src.split('^')[1].replace(new RegExp("%22","gm"),"\"").replace(new RegExp("%27","gm"),"\'");
						try {
							scriptOptions = eval("("+srcOptions+")");
						} catch (err) {
							if (typeof(JSON) == 'object' && JSON.parse) {
		        				scriptOptions = JSON.parse(srcOptions);
							}
						}
						this.sources[this.sources.length] = scriptOptions;
					} else if(src.indexOf('&') != -1) {
						var srclen = src.split('&').length;
						if(srclen == 1){
							var srcOptions = src.split('&')[1].replace(new RegExp("%22","gm"),"\"").replace(new RegExp("%27","gm"),"\'");
							try {
								scriptOptions = eval("("+srcOptions+")");
							} catch (err) {
								if (typeof(JSON) == 'object' && JSON.parse) {
			        				scriptOptions = JSON.parse(srcOptions);
								}
							}
							this.sources[this.sources.length] = scriptOptions;
						}else{
							var srcOptions = src.substr(src.indexOf('&')+1).replace(new RegExp("%22","gm"),"\"").replace(new RegExp("%27","gm"),"\'");;
							try {
								scriptOptions = eval("("+srcOptions+")");
							} catch (err) {
								if (typeof(JSON) == 'object' && JSON.parse) {
			        				scriptOptions = JSON.parse(srcOptions);
								}
							}
							this.sources[this.sources.length] = scriptOptions;
						}
					}
				}
			}
			return this.sources;
		}
	};
	/**
	 * 	调试开发, 打开后将输出日志
	 *  online模式下，异常信息将记录到draggon服务器上报警
	 *  window.dmtrack 此变量只有online模式才存在，因此可以用于区分debug/online
	 *  注意拷贝线上html源码时请将不需要的相关代码删除。
	 */
	$.DEBUG_MOD = (typeof window.dmtrack === "undefined") ? true : false;
	//立即解析include
	perfmjs.includeres.load();
})(window);