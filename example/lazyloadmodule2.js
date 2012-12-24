!(function($) {
	$.base("base.lazyloadmodule2", {
		init: function(arg) {
			this.createHTML();
			return this;
		},
		createHTML: function(){
			alert("lazyloadModule2 loaded!");
		},
		end: 0
	});
	$.base.lazyloadmodule2.defaults = {
		scope: 'singleton',
		end: 0
	};
})(window);