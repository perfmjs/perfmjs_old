!(function(){
    function importJS(src) {
    	document.write('<script type="text/javascript" src="' + src + '"></scr' + 'ipt>');
    }
    importJS('/perfmjs/js/app2/module1.js');
    importJS('/perfmjs/js/app2/module2.js');
    importJS('/perfmjs/js/app2/module3.js');
    importJS('/perfmjs/js/app2/lazyinitmodule.js');
    importJS('/perfmjs/js/app2/start.js');
})();