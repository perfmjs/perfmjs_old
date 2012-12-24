!(function($) {
	$.base("base.lazyloadmodule1", {
		init: function(sb) {
			this.sandbox = sb;
			this.createHTML();
			this.sandbox.on(perfmjs.app.config.events.DELETE, this.create);
			return this;
		},
		create: function(data) {
			//alert("lazyloadModule1 got the message:" + data.msg);
		},
		createHTML: function() {
			//alert("lazyloadModule1 loaded: get data from data-conf:" + this.options.data.name);
		},
		end: 0
	});
	$.base.lazyloadmodule1.defaults = {
		scope: 'singleton',
		end: 0
	};
})(window);