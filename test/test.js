/*global Chainer: false, module: false, test:false, equal: false, deepEqual: false, ok: false*/

$(document).ready(function() {

  module('Core');

  test('Chainer.extend', function() {
    var base = { foo:1, bar:2, baz:3}, ext = { foo:4, bar:5 };

    Chainer.extend(base, ext);

    deepEqual(base, { foo:4, bar:5, baz:3 });
  });

  test('Chainer.makeArray', function() {
    var testdiv = document.getElementById('core-makearray-test');
    var divs = testdiv.getElementsByTagName('div');
    ok(Chainer.makeArray(divs) instanceof Array);
    equal(Chainer.makeArray(divs).length, 3);
  });


  module('Methods');

  test('map', function() {
    var ch = new Chainer();

    deepEqual(ch.start([1,2,3,4]).map(function(v,i) { return v + i; }).makeArray(), [1,3,5,7], 'use map function');
  });


  module('Extending');

  test('basic', function() {
    var ch =new Chainer();

    ch.pp = function() {
      return this.map(function(v) {
        return v + 1;
      });
    };

    deepEqual(ch.start([1,2,3,4]).pp().pp(), [3,4,5,6], 'basic extending');
  });


  module('Inheritance');

  test('basic', function() {
    function MyChainer() {}

    MyChainer.prototype = new Chainer();

    MyChainer.prototype.pp = function() {
      return this.map(function(v) {
        return v + 1;
      });
    };

    var ch = new MyChainer();
    deepEqual(ch.start([1,2,3,4]).pp().pp(), [3,4,5,6], 'basic inheritance');
  });

});
