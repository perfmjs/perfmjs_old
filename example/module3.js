!(function($) {
	$.base("base.module3", {
		init: function(sb) {
			this.sandbox = sb;
			this.createHTML();
			this.sandbox.on(perfmjs.app.config.events.DELETE, this.create);
			this.sandbox.on("perfmjs.ready", function() {perfmjs.logger.log("All modules are ready222!");});
			return this;
		},
		create: function(data) {
			alert("Module3 got the message:" + data.msg);
		},
		createHTML: function() {
			//alert("module3.createHTML");
		},
		end:0
	});
	$.base.module3.defaults = {
		scope: 'singleton',
		end: 0
	};
})(window);