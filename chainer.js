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

    /**
      * If given value is Array-like object, convert it to array,
      * else return [ value ].
      *
      *     @param {Whatever} value
      */
    , makeArray: function(value) {
      // algorithm basing jQuery.makeArray
      var ret = [], class2type = {}, i
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

      if(value != null) {
        var t = type(value);

        if(value.length == null
           || t === "string"
           || t === "function"
           || t === "regexp"
           || isWindow(value)) {

          ret.push(value);

        } else {
          Chainer.merge(ret, value);
        }
      }

      return ret;
    }

  });

  Chainer.extend(Chainer.prototype, {
    // start func
    start: function(collection) {
      return Chainer.extend(
        Chainer.makeArray(collection)
        , this);
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

    , select: function(callback, thisp) {
      return this.filter(callback, thisp);
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
      return Chainer.extend(this.reduce(function(prev, curr, i) {
        return Chainer.merge(prev, curr);
      }, []), ret);
    }

    // recursive
    , rmap: function(callback, thisp, indexes) {

      console.dir(this,callback,thisp,indexes);

      // もうちょっと考えよう。
      function isCollection(arg) {
        return (typeof arg.length === 'number' && 0 < arg.length);
      }

      if(!isCollection(this)) {
        return callback.call(thisp || this
                             , this
                             , indexes
                             , this);
      } else {
        return this.map.call(this, function(val, idx){
          return this.rmap.call(Chainer.extend(val, this.empty())
                         , callback
                         , this
                         , idx);
        }, this);
      }

    }
  });

  return Chainer;

}());
