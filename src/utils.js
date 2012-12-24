/**
 * 工具类
 * @date 2012-12-01
 */
!(function($) {
    var _extendIf = function(target, o){
        if (o === undefined) {
            o = target;
            target = this;
        }
        for (var p in o) {
            if (typeof target[p] === 'undefined') {
                target[p] = o[p];
            }
        }
        return target;
    };
    /**
     * Returns the namespace specified and creates it if it doesn't exist
     * <pre>
     * jQuery.namespace('Platform.winport');
     * * jQuery.namespace('Platform.winport', 'Platform.winport.diy');
     * </pre>
     *
     * Be careful when naming packages. Reserved words may work in some browsers
     * and not others. For instance, the following will fail in Safari:
     * <pre>
     * jQuery.namespace('really.long.nested.namespace');
     * </pre>
     * jQuery fails because "long" is a future reserved word in ECMAScript
     *
     * @method namespace
     * @static
     * @param  {collection} arguments 1-n namespaces to create.
     * @return {object}  A reference to the last namespace object created.
     */
	var _namespace = function() {
        var a = arguments, o, i = 0, j, d, arg;
        for (; i < a.length; i++) {
            o = window;
            arg = a[i];
            if (arg.indexOf('.')) {
                d = arg.split('.');
                for (j = (d[0] == 'window') ? 1 : 0; j < d.length; j++) {
                    o[d[j]] = o[d[j]] || {};
                    o = o[d[j]];
                }
            } else {
                o[arg] = o[arg] || {};
            }
        }
    };
    //在这定义好core常用的命名空间，所有命名空间一律全小写
    _namespace("perfmjs.json", 'perfmjs.includeres', 'perfmjs.loadres', "perfmjs.app");
    perfmjs.utils = {
    	extendIf: _extendIf,
    	namespace: _namespace,
    	//以下方法实现都是来自jquery1.8.2的对应方法:_type,_isFunction,_isArray,_each,_isWindow,_isNumeric, _isPlainObject,_extend
    	each: function(obj, callback, args) {
    		var name, i = 0, length = obj.length, isObj = length === undefined || this.isFunction( obj );
    		if (args) {
    			if ( isObj ) {
    				for (name in obj) {
    					if (callback.apply(obj[name], args) === false) {
    						break;
    					}
    				}
    			} else {
    				for (; i < length;) {
    					if (callback.apply( obj[ i++ ], args) === false ) {
    						break;
    					}
    				}
    			}
    		// A special, fast, case for the most common use of each
    		} else {
    			if (isObj) {
    				for (name in obj) {
    					if (callback.call( obj[ name ], name, obj[ name ] ) === false) {
    						break;
    					}
    				}
    			} else {
    				for (; i < length;) {
    					if (callback.call( obj[ i ], i, obj[ i++ ] ) === false) {
    						break;
    					}
    				}
    			}
    		}
    		return obj;
    	},
    	class2type: undefined,
    	type: function(obj) {
    		if (this.class2type === undefined) {
    			var _class2type = this.class2type = {};
    		    this.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
    		    	_class2type["[object " + name + "]"] = name.toLowerCase();
    		    });
    		}
    		return obj == null ? String(obj) : this.class2type[Object.prototype.toString.call(obj)] || "object";
    	},
    	isFunction: function(obj) {
    		return this.type(obj) === "function";
    	},
    	isArray: Array.isArray || function( obj ) {
    		return this.type(obj) === "array";
    	},
    	isNumeric: function(obj) {
    		return !isNaN(parseFloat(obj)) && isFinite(obj);
    	},
    	isWindow: function(obj) {
    		return obj != null && obj == obj.window;
    	},
    	isPlainObject: function(obj) {
    		var core_hasOwn = Object.prototype.hasOwnProperty;
    		// Must be an Object.
    		// Because of IE, we also have to check the presence of the constructor property.
    		// Make sure that DOM nodes and window objects don't pass through, as well
    		if (!obj || this.type(obj) !== "object" || obj.nodeType || this.isWindow(obj)) {
    			return false;
    		}
    		try {
    			// Not own constructor property must be Object
    			if (obj.constructor &&
    				!core_hasOwn.call(obj, "constructor") &&
    				!core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
    				return false;
    			}
    		} catch (e) {
    			// IE8,9 Will throw exceptions on certain host objects #9897
    			return false;
    		}
    		// Own properties are enumerated firstly, so to speed up,
    		// if last one is own, then all properties are own.
    		var key;
    		for (key in obj){}
    		return key === undefined || core_hasOwn.call(obj, key);
    	},
    	extend: function() {
    		var options, name, src, copy, copyIsArray, clone,
    		target = arguments[0] || {},
    		i = 1,
    		length = arguments.length,
    		deep = false;
        	// Handle a deep copy situation
        	if (typeof target === "boolean") {
        		deep = target;
        		target = arguments[1] || {};
        		// skip the boolean and the target
        		i = 2;
        	}
        	// Handle case when target is a string or something (possible in deep copy)
        	if (typeof target !== "object" && !this.isFunction(target)) {
        		target = {};
        	}
        	// extend jQuery itself if only one argument is passed
        	if (length === i) {
        		target = this;
        		--i;
        	}
        	for (; i < length; i++) {
        		// Only deal with non-null/undefined values
        		if ( (options = arguments[ i ]) != null ) {
        			// Extend the base object
        			for (name in options) {
        				src = target[name];
        				copy = options[name];
        				// Prevent never-ending loop
        				if (target === copy) {
        					continue;
        				}
        				// Recurse if we're merging plain objects or arrays
        				if (deep && copy && ( this.isPlainObject(copy) || (copyIsArray = this.isArray(copy)))) {
        					if (copyIsArray) {
        						copyIsArray = false;
        						clone = src && this.isArray(src) ? src : [];
        					} else {
        						clone = src && this.isPlainObject(src) ? src : {};
        					}
        					// Never move original objects, clone them
        					target[name] = this.extend(deep, clone, copy);
        				// Don't bring in undefined values
        				} else if ( copy !== undefined ) {
        					target[name] = copy;
        				}
        			}
        		}
        	}
        	// Return the modified object
        	return target;
        },
    	trim: String.prototype.trim && !String.prototype.trim.call("\uFEFF\xA0") ?
			function(text) {
				return text==null?"":String.prototype.trim.call( text );
			} : function(text) {
				return text==null?"":(text + "").replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
		},
    	now: function() {
    		return (new Date()).getTime();
    	},
    	error: function(msg) {
    		throw new Error(msg);
    	},
    	parseJSON: function(data) {
    		if (!data || typeof data !== "string") {
    			return null;
    		}
    		// Make sure leading/trailing whitespace is removed (IE can't handle it)
    		data = this.trim(data);
    		// Attempt to parse using the native JSON parser first
    		if (window.JSON && window.JSON.parse) {
    			return window.JSON.parse(data);
    		}
    		// Make sure the incoming data is actual JSON
    		// Logic borrowed from http://json.org/json2.js
    		if ( /^[\],:{}\s]*$/.test(data.replace(/\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g, "@")
    			.replace(/"[^"\\\r\n]*"|true|false|null|-?(?:\d\d*\.|)\d+(?:[eE][\-+]?\d+|)/g, "]")
    			.replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) {
    			return (new Function("return " + data))();
    		}
    		this.error("Invalid JSON: " + data);
    	},
    	merge: function(first, second) {
    		var l = second.length, i = first.length, j = 0;
    		if (typeof l === "number") {
    			for (; j < l; j++) {
    				first[ i++ ] = second[j];
    			}
    		} else {
    			while (second[j] !== undefined) {
    				first[i++] = second[j++];
    			}
    		}
    		first.length = i;
    		return first;
    	},
    	formatJSONMessage: function(jsonData) {
    		//json格式消息与响应的JSONMessage对象保持一致, status: 成功-success, 失败-fail
    		var jsonMessage = {status:"success",code:'0',msg:'',result:{}};
    		try {
    			if (typeof jsonData === 'string') {
    				result = eval("(" + jsonData + ")");
    			} else {
    				result = jsonData;
    			}
    			//对不规范响应内容进行处理
    			if (result != undefined && result.status == undefined) {
    				jsonMessage.stauts = "success";
    				jsonMessage.code = "0";
    				jsonMessage.msg = "";
    				jsonMessage.result = result;
    			}  else if (result != undefined) {
    				jsonMessage = result;
    			}
    		} catch(err) {
    			try {
    				if (typeof(JSON) == 'object' && JSON.parse) {
        				var result = JSON.parse(jsonData);
    					//对不规范响应内容进行处理
    					if (result != undefined && result.status == undefined) {
    						jsonMessage.stauts = "success";
    						jsonMessage.code = "0";
    						jsonMessage.msg = "";
    						jsonMessage.result = result;
    					}  else if (result != undefined) {
    						jsonMessage = result;
    					}
    				} else {
    					//服务器响应失败，错误代码：XXX，请稍后重试或联系我们的客服！
    					jsonMessage = {status:"fail",code:'0',msg:"服务器响应失败，请稍后重试或联系我们的客服！",result:{}};
    				}
    			} catch(err) {
    				jsonMessage = {status:"fail",code:'0',msg:err.description||err.toString()||'',result:{}};
    			}
    		}
    		return jsonMessage || {status:"fail",code:'0',msg:'',result:{}};
    	},
    	end: 0
    };
})(window);