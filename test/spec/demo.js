//可参考：http://net.tutsplus.com/tutorials/javascript-ajax/testing-your-javascript-with-jasmine/
(function(){
describe('demo', function() {
	it('结果应该为1', function () {
	  var foo = 0;// set up the world
	  foo++;// call your application code
	  expect(foo).toEqual(1); // passes because foo == 1
	});
});
}());