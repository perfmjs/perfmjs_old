!(function($) {
	$.base("base.lazyinitmodule", {
		init: function(sb) {
			this.sandbox = sb;
			this.createHTML();
			return this;
		},
		createHTML: function() {
			//alert("lazyInitModule被loaded");
			this.sandbox.notify("perfmjs.lazyload", {"moduleId": "lazyloadmodule3"});
		},
		end: 0
	});
	$.base.lazyinitmodule.defaults = {
		scope: 'singleton',
		end: 0
	};
})(window);