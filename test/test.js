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
    ok(Chainer.makeArray(divs) instanceof Array, 'return value is Array instance');
    equal(Chainer.makeArray(divs).length, 3, 'return value has length property with correct value');
  });


  module('Basic Methods');

  test('map', function() {
    var ch = new Chainer();
    deepEqual(ch.init([1,2,3,4]).map(function(v,i) { return v + i; }).makeArray(), [1,3,5,7]);
  });

  test('filter', function() {
    var ch = new Chainer();
    deepEqual(ch.init([1,2,3,4]).filter(function(v,i) { return !(v%2); }).makeArray(), [2,4]);
  });

  test('reduce', function() {
    var ch = new Chainer();
    deepEqual(ch.init([1,2,3,4]).reduce(function(prev, curr, i) { return prev + curr; }), 10, 'no initial value');
    deepEqual(ch.init([4,5,6,7]).reduce(function(prev, curr, i) { return prev + curr; }, 3), 25, 'initial value supplied');
  });

  test('reduceRight', function() {
    var ch = new Chainer();
    deepEqual(ch.init([1,2,3,4]).reduceRight(function(prev, curr, i) { return prev + curr; }), 10, 'no initial value');
    deepEqual(ch.init([4,5,6,7]).reduceRight(function(prev, curr, i) { return prev + curr; }, 3), 25, 'initial value supplied');
  });

  test('every', function() {
    var ch = new Chainer();
    deepEqual(ch.init([true, true, true]).every(function(val, i) { return val; }), true, 'true');
    deepEqual(ch.init([true, true, false]).every(function(val, i) { return val; }), false, 'false');
  });

  test('some', function() {
    var ch = new Chainer();
    deepEqual(ch.init([true, false, false]).some(function(val, i) { return val; }), true, 'true');
    deepEqual(ch.init([false, false, false]).some(function(val, i) { return val; }), false, 'false');
  });

  test('flatten', function() {
    var ch = new Chainer();
    deepEqual(ch.init([[1,2],[3,4],[5,6]]).flatten().makeArray(), [1,2,3,4,5,6]);
  });


  module('Recursive Methods');

  test('reach', function() {
    var ch = new Chainer();
    deepEqual(ch.init([[1,2],[3,4,[5,6]],7,8]).reach(function(v, i) { console.log(v,i); return v+1;} ).makeArray(), [[1,2],[3,4,[5,6]],7,8]);
  });

  test('rmap', function() {
    var ch = new Chainer();
    deepEqual(ch.init([[1,2],[3,4,[5,6]],7,8]).rmap(function(val, i) { return val+1;} ).makeArray(), [[2,3],[4,5,[6,7]],8,9]);
    deepEqual(ch.init(['abc', 'def', ['abc', 'def']]).rmap(function(v, i){ return 'abc' === v; }), [true, false,[true, false]], 'Supports "===" operator correctly.');
  });

  test('rfilter', function() {
    var ch = new Chainer();
    deepEqual(ch.init([[1,2],[3,4,[5,6]],7,8]).rfilter(function(val, i) {return !(val%2);} ).makeArray(), [[2],[4,[6]],8]);
    deepEqual(ch.init(['abc', 'def', ['abc', 'def']]).rfilter(function(v, i){ return 'abc' === v; }), ['abc', ['abc']], 'Supports "===" operator correctly.');
  });

  test('', function() {
  });


  module('Extending');

  test('basic', function() {
    var ch =new Chainer();

    ch.pp = function() {
      return this.map(function(v) {
        return v + 1;
      });
    };

    deepEqual(ch.init([1,2,3,4]).pp().pp(), [3,4,5,6], 'basic extending');
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
    deepEqual(ch.init([1,2,3,4]).pp().pp(), [3,4,5,6], 'basic inheritance');
  });

});
