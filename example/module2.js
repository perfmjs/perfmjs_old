!(function($) {
	$.base("base.module2", {
		init: function(sb) {
			this.sandbox = sb;
			this.createHTML();
			this.sandbox.on(perfmjs.app.config.events.DELETE, this.create);
			this.sandbox.on("perfmjs.ready", function() {perfmjs.logger.log("All modules are ready!");});
			return this;
		},
		create: function(data) {
			alert("Module2 got the message:" + data.msg);
		},
		createHTML: function() {
			//alert(i.i);
		},
		end:0
	});
	$.base.module2.defaults = {
		scope: 'singleton',
		end: 0
	};
})(window);