/*
 * Copyright (c) 2008-2011, nektixe, Hiraku NAKANO. All rights reserved.
 * Code licensed under the MIT License:
 * Original Code: http://code.nanigac.com/source/view/427
 *
 * T.js
 * DOMBuilder-like template engine for JavaScript
 * https://github.com/hirak/T.js
 */

void function(nameSpace){
    var global = Function("return this")()
      , document
      , delimeter = " "
      , htmlCore = "a abbr address area b base bdo blockquote br button canvas comment cite code col colgroup del div dfn dl dt dd em fieldset form h1 h2 h3 h4 h5 h6 hr i iframe img input ins kbd label legend li link map noscript object ol optgroup option p param pre q samp script select small span strong style sub sup table tbody td textarea tfoot th thead tr ul var body html head meta title"
      , html4Only = "acronym applet basefont big center dir font frame frameset isindex noframes s strike tt u wbr"
      , html5Only = "article aside audio bdi caption command datalist details dialog embed figure figcaption footer header hgroup keygen m mark menu meter nav output progress ruby rp rt section source summary time video"
      , STRING = "string"
      , Array = global.Array
      , Object = global.Object
      , _slice = Array.prototype.slice
      ;

    if (typeof window == 'undefined') {
        //node.js
        document = require('./document.js');
        module.exports = T;
    } else {
        //browser
        document = global.document;

        if (typeof define == 'undefined') {
            global[nameSpace] = T;
        } else {
            define(T);
        }
    }

    function normalize(arr) {
        var i, l, cur, j, ll, r=[];
        for (i=0,l=arr.length; i<l; ++i) {
            cur = arr[i];
            if (cur instanceof Array || (cur.length && cur.item)) {
                for (j=0, ll=cur.length; j<ll; ++j) {
                    r[r.length] = cur[j];
                }
            } else {
                r[r.length] = cur;
            }
        }
        return r;
    }

    function TShorthand(list) {
        var i, cur;
        if (typeof list == STRING) {
            list = list.split(delimeter);
        } else if (!(list instanceof Array)) {
            list = htmlCore.split(delimeter);
        }

        for (i=0; cur = list[i++];) {
            T[cur] = T(cur);
        }
    }
    T.Shorthand = TShorthand;
    TShorthand();

    TShorthand.html4 = function TShorthandHtml4() {
        TShorthand(html4Only);
    };

    TShorthand.html5 = function TShorthandHtml5() {
        TShorthand(html5Only);
    };

    TShorthand.full = function TShorthandFull() {
        TShorthand(html4Only + delimeter + html5Only);
    };

    function T(node) {
        if (typeof node == STRING) {
            node = document.createElement(node);
        }
        return arguments.length == 1 ? curryT
                                     : curryT(normalize(arguments).slice(1));

        function curryT(arg1) {
            var tag = node.cloneNode(true),
                attrName, styleName, currentAttr, i, l,
                id, className,
                args = normalize(arguments);

            if (args.length == 0) {
                return tag;
            }
            if (args.length == 1 && typeof arg1 == STRING && /^[.#][0-9A-Za-z.#\-_]+$/.exec(arg1)) {
                if (id = arg1.match(/#[^.#]+/)) {
                    id = id[0].slice(1);
                    tag.id = id;
                }
                if (className = arg1.match(/\.[^.#]+/g)) {
                    tag.className = className.join('').replace(/\./g,' ').slice(1);
                }
                if (id || className) {
                    return T(tag);
                }
            }

            if (arg1.constructor === Object) {
                i = 1;
                for (attrName in arg1) {
                    currentAttr = arg1[attrName]
                    if (attrName == "style") {
                        for (styleName in currentAttr) {
                            tag.style[styleName] = currentAttr[styleName];
                        }
                    } else {
                        tag[attrName] = currentAttr;
                    }
                }
            } else {
                i = 0;
            }

            for (l=args.length; i<l; ++i) {
                tag.appendChild(
                    args[i].nodeType != null ? args[i]
                                             : document.createTextNode(args[i])
                );
            }
            return tag;
        }
    }

    T.DF = T.DocumentFragment = T(document.createDocumentFragment());
    T.Comment = function TComment(str){
        return document.createComment(""+str);
    };
    T.Text = function TText(str) {
        return document.createTextNode(""+str);
    };

    //helper
    T.$ = $;
    function $(arr) {
        var copy = arr.concat();
        copy.chunk = $chunk;
        copy.map = $map;
        return copy;
    }

    function $chunk(size, pad) {
        if (typeof size != "number") throw new TypeError("parameter 'size' required");

        var inputLen = this.length
          , remainder = inputLen % size
          , chunkLen = Math.ceil(inputLen / size)
          , chunkedArr = new Array(chunkLen)
          , i, j, k
          ;

        for (i=k=0; i<chunkLen; i++) {
            chunkedArr[i] = new Array(size);
            for (j=0; j<size; j++, k++) {
                chunkedArr[i][j] = this[k];
            }
        }
        i--;
        if (remainder) {
            if (pad !== void 0) for (j=remainder; j<size; j++) {
                chunkedArr[i][j] = pad;
            } else {
                chunkedArr[i].length = remainder;
            }
        }

        return $(chunkedArr);
    }

    function $map(callback) {
        var inputLen = this.length
          , callbacks = _slice.call(arguments, 1)
          , newArr = new Array(inputLen)
          , i
          , nextArgs
          ;
        callbacks.cachedLen = callbacks.length;

        if (callback instanceof Array) {
            //ordered apply
            for (i=0,j=0; i<inputLen; i++) {
                if (callback[j].nodeType != null) {
                    callback[j] = T(callback[j]);
                }
                newArr[i] = callback[j](_mapRecursive(this[i], callbacks));
                if (++j >= callback.length) {
                    j = 0;
                }
            }

        } else if (callback.middle) {
            var translated
              , first = 0, last = inputLen - 1
              ;
            //first, middle, last apply
            if (callback.first && callback.first.nodeType != null) {
                callback.first = T(callback.first);
            }
            if (callback.middle.nodeType != null) {
                callback.middle = T(callback.middle);
            }
            if (callback.last && callback.last.nodeType != null) {
                callback.last = T(callback.last);
            }
            for (i=0; i<inputLen; i++) {
                translated = _mapRecursive(this[i], callbacks);
                newArr[i] = (i === first && callback.first) ? callback.first(translated) :
                            (i === last && callback.last)   ? callback.last(translated)  :
                                                              callback.middle(translated);
            }
        } else {
            //normal apply
            if (callback.nodeType != null) {
                callback = T(callback);
            }
            for (i=0; i<inputLen; i++) {
                newArr[i] = callback(_mapRecursive(this[i], callbacks));
            }
        }
        return $(newArr);
    }

    function _mapRecursive(nextInput, callbacks) {
        if (callbacks.cachedLen && nextInput instanceof Array) {
            return $map.apply(nextInput, callbacks);
        } else {
            return nextInput;
        }
    }

    T.$nest = $nest;
    function $nest() {
        var nests = _slice.call(arguments);
        for (var i=0,l=nests.length; i<l; i++) {
            if (nests[i].nodeType != null) {
                nests[i] = T(nests[i]);
            }
        }
        return function(){
            var i = nests.length - 1
              , tag = _slice.call(arguments)
              ;
            for (; i>=0; i--) {
                tag = nests[i](tag);
            }
            return tag;
        };
    }

}("T"); //please change better!
