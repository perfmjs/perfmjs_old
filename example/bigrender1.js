!(function($) {
	$.base("base.bigrender1", {
		init: function(arg) {
			this.createHTML();
			return this;
		},
		createHTML:function(){
			alert("bigrender1 loaded: get data from data-conf:" + this.options.data.name);
		},
		end: 0
	});
	$.base.bigrender1.defaults = {
		scope: 'singleton',
		end: 0
	};
})(window);

