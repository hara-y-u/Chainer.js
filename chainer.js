/**
 * Chainer.js - Collection Processing with Chain Methods
 *  * License: [MIT](http://www.opensource.org/licenses/mit-license)
 */
window.Chainer = (function() {

  function Chainer() {}

  /**
   * Extend the Object with another Object's properties.
   *
   *     @param {Object} base Object to be extended
   *     @param {Object} ext  Object to extend `base` with its properties
   */
  Chainer.extend = function(base, ext) {
    // algorithm basing jQuery.extend
    var name
    , src, copy
    ;
    // Extend the base object
    for(name in ext) {
      src = base[name];
      copy = ext[name];

      // Prevent never-ending loop
      if(base === copy) {
        continue;
      }

      if(copy !== undefined) {
        base[ name ] = copy;
      }
    }

    return base;
  };

  Chainer.extend(Chainer, {

    /**
     * Merge two arrays.
     *
     *     @param {Array} first First array to merge.
     *     @param {Array} second Second array to merge.
     */
    merge: function(first, second) {
      // algorithm basing jQuery.merge
      var i = first.length,
      j = 0;

      if ( typeof second.length === "number" ) {
        for ( var l = second.length; j < l; j++ ) {
          first[ i++ ] = second[ j ];
        }

      } else {
        while ( second[j] !== undefined ) {
          first[ i++ ] = second[ j++ ];
        }
      }

      first.length = i;

      return first;
    }

    , isIteratable: function(obj) {
      var class2type = {}, i, t
      , classes = "Boolean Number String Function Array Date RegExp Object".split(" ")
      ;

      for(i = classes.length; i--;) {
        class2type[ "[object " + classes[i] + "]" ] = classes[i].toLowerCase();
      }

      function type( obj ) {
        return obj == null ?
          String( obj ) :
          class2type[ Object.prototype.toString.call(obj) ] || "object";
      }

      function isWindow( obj ) {
        return obj && typeof obj === "object" && "setInterval" in obj;
      }

      t = type(obj);

      return !(obj.length == null
               || t === "string"
               || t === "function"
               || t === "regexp"
               || isWindow(obj));

    }

    /**
      * If given value is Array-like object, convert it to array,
      * else return [ obj ].
      *
      *     @param {Whatever} obj
      */
    , makeArray: function(obj) {
      // algorithm basing jQuery.makeArray
      var ret = [];
      if(!Chainer.isIteratable(obj)) {
          ret.push(obj);
        } else {
          Chainer.merge(ret, obj);
        }
      return ret;
    }

  });

  Chainer.extend(Chainer.prototype, {
    chainer: '0.0.1'

    // init func
    , init: function(collection) {
      return Chainer.extend(
        Chainer.makeArray(collection)
        , this.empty());
    }

    , clone: function() {
      return Chainer.extend([], this);
    }

    , empty: function() {
      var ret = this.clone();
      ret.length = 0;
      return ret;
    }

    // utils
    , makeArray: function() {
      return Chainer.makeArray(this);
    }

    , getIterator: function() {
      var len = this.length
      , idx = 0
      , arr = this.makeArray()
      ;
      return {
        hasNext: function() {
          return idx < len;
        }
        , next: function() {
          return arr[idx++];
        }
        , getIndex: function() {
          return idx;
        }
      };
    }

    // basics
    , each: function(callback, thisp) {
      var i, l = this.length
      ;
      for(i = 0; i < l; i++) {
        callback.call(thisp || this
                      , this[i]
                      , i
                      , this.makeArray()
                     );
      }

      return this;
    }

    , map: function(callback, thisp) {
      var ret = this.empty()
      , that = this
      ;
      this.each(function(val, idx, arr) {
        ret.push(callback.call(thisp || that
                               , val
                               , idx
                               , arr
                               , ret.makeArray()
                              ));
      });

      return ret;
    }

    , filter: function(callback, thisp) {
      var ret = this.empty()
      , that = this
      ;
      this.each(function(val, idx, arr) {
        if(callback.call(thisp || that
                         , val
                         , idx
                         , arr
                         , ret.makeArray()
                        )) {
          ret.push(val);
        }
      });

      return ret;
    }

    , reduce: function(callback, initial) {
      var ret = initial || this.shift()
      ;
      this.each(function(val, idx, arr) {
        ret = callback(ret, val, idx, arr);
      });

      return ret;
    }

    , reduceRight: function(callback, initial) {
      var ret = initial || this.pop()
      , arr = this.makeArray()
      , l = this.length
      ;
      while(l--) {
        ret = callback(ret, this[l], l, arr);
      }

      return ret;
    }

    , every: function(callback, thisp) {
      var i, l = this.length
      ;
      for(i = 0; i < l; i++) {
        if(!callback.call(thisp || this
                         , this[i]
                         , i
                         , this.makeArray()
                        )) {
          return false;
        }
      }

      return true;
    }

    , some: function(callback, thisp) {
      var i, l = this.length
      ;
      for(i = 0; i < l; i++) {
        if(callback.call(thisp || this
                         , this[i]
                         , i
                         , this.makeArray()
                        )) {
          return true;
        }
      }

      return false;
    }

    , flatten: function() {
      var ret = this.empty();
      return this.init(this.reduce(function(prev, curr, i) {
        return Chainer.merge(prev, curr);
      }, []));
    }

    // recursive
    , reach: function(callback, thisp) {
      var that = this
      ;
      return (function _reach(obj, callback, indexes) {
        if(!indexes) { indexes = []; }
        var tmp;

        if(!Chainer.isIteratable(obj)) {
          return callback.call(thisp || that
                               , obj
                               , indexes
                               , that.makeArray());
        } else {
          return that.init(obj).each(function(val, idx){
            tmp = Chainer.makeArray(indexes);
            tmp.push(idx);
            return _reach(val, callback, tmp);
          });
        }
      }(this.makeArray(), callback));
    }

    , rmap: function(callback, thisp) {
      var that = this
      ;
      return (function _rmap(obj, callback, indexes) {
        if(!indexes) { indexes = []; }
        var tmp;

        if(!Chainer.isIteratable(obj)) {
          return callback.call(thisp || that
                               , obj
                               , indexes
                               , that.makeArray());
        } else {
          return that.init(obj).map(function(val, idx){
            tmp = Chainer.makeArray(indexes);
            tmp.push(idx);
            return _rmap(val, callback, tmp);
          });
        }
      }(this.makeArray(), callback));
    }

    , rfilter: function(callback, thisp) {
      var that = this
      ;
      return (function _rfilter(obj, callback, indexes) {
        var ret, tmp
        ;
        if(!indexes) { indexes = []; }
        if(!Chainer.isIteratable(obj)) {
          return callback.call(thisp || that
                               , obj
                               , indexes
                               , that.makeArray());
        } else {
          return that.init(
            that.init(obj).reduce(function(prev, curr, idx){
              tmp = Chainer.makeArray(indexes);
              tmp.push(idx);
              ret = _rfilter(curr, callback, tmp);
              if(ret) { prev.push(Chainer.isIteratable(curr) ? ret : curr); }
              return prev;
            }, []));
        }
      }(this.makeArray(), callback));
    }

  });

  return Chainer;

}());
