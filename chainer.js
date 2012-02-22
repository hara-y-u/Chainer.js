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

    // start func
    , start: function(collection) {
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
      if(!indexes) { indexes = []; }
      var tmp;

      if(!this.chainer) {
        return callback.call(thisp || this
                             , this
                             , indexes
                             , this);
      } else {
        return this.map.call(this, function(val, idx){
          tmp = Chainer.makeArray(indexes);
          tmp.push(idx);
          return this.rmap.call(Chainer.isIteratable(val)
                                  ? Chainer.extend(val, this.empty())
                                  : val
                                , callback
                                , this
                                , tmp);
        }, this);
      }
    }

    // , rfilter: function(callback, thisp, indexes) {
    //   var ret;

    //   function mapFilter(callback) {
    //     return this.map(function(val, idx) {
    //       return callback.call(this, val, idx);
    //     }).filter(function(val, idx) {
    //       return (val !== undefined);
    //     });
    //   }

    //   if(!Chainer.isCollection(this)) {
    //     ret =  callback.call(thisp || this
    //                          , this
    //                          , indexes
    //                          , this);
    //     if(ret) {
    //       // this works only for Numbers
    //       return parseInt(this.toString(), 10);
    //     } else {
    //       return undefined;
    //     }
    //   } else {
    //     return mapFilter.call(this, function(val, idx){
    //       return this.rfilter.call(Chainer.extend(val, this.empty())
    //                      , callback
    //                      , this
    //                      , idx);
    //     }, this);
    //   }
    // }
    , rfilter: function(callback, thisp, indexes) {
    }

  });

  return Chainer;

}());
