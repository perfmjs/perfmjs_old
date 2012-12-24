!(function($) {
	$.base("base.lazyloadmodule3", {
		init: function(arg) {
			this.createHTML();
			return this;
		},
		createHTML: function() {
			alert("lazyloadModule3 loaded");
		},
		end: 0
	});
	$.base.lazyloadmodule3.defaults = {
		scope: 'singleton',
		end: 0
	};
})(window);