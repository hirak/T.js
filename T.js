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
    var global = Function("return this")(),
        document = global.document,
        delimeter = " ",
        htmlCore = "a abbr address area b base bdo blockquote br button canvas comment cite code col colgroup del div dfn dl dt dd em fieldset form h1 h2 h3 h4 h5 h6 hr i iframe img input ins kbd label legend li link map noscript object ol optgroup option p param pre q samp script select small span strong style sub sup table tbody td textarea tfoot th thead tr ul var body html head meta title",
        html4Only = "acronym applet basefont big center dir font frame frameset isindex noframes s strike tt u wbr",
        html5Only = "article aside audio bdi caption command datalist details dialog embed figure figcaption footer header hgroup keygen m mark menu meter nav output progress ruby rp rt section source summary time video",
        STRING = "string";

    if (global[nameSpace] != null) {
        throw new ReferenceError;
    }
    global[nameSpace] = T;

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

    TShorthand.html4 = function TShorthandHtml4() {
        TShorthand(htmlCore + delimeter + html4Only);
    };

    TShorthand.html5 = function TShorthandHtml5() {
        TShorthand(htmlCore + delimeter + html5Only);
    };

    TShorthand.full = function TShorthandFull() {
        TShorthand(htmlCore + delimeter + html4Only + delimeter + html5Only);
    };

    function T(node) {
        if (typeof node == STRING) {
            node = document.createElement(node);
        }
        return arguments.length == 1 ? curryT
                                     : curryT(normalize(arguments).slice(1));

        function curryT(arg1) {
            var tag = (typeof node == STRING) ? document.createElement(node) : node.cloneNode(true),
                attrName, styleName, currentAttr, i, l,
                id, className,
                args = normalize(arguments);

            if (args.length == 0) {
                return tag;
            }
            arg1 = args[0];
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

            if (arg1.nodeType != null || typeof arg1 == STRING) {
                i = 0;
            } else {
                i = 1;
                for (attrName in arg1) {
                    currentAttr = arg1[attrName]
                    if (attrName == "style" && currentAttr instanceof Object) {
                        for (styleName in currentAttr) {
                            tag.style[styleName] = currentAttr[styleName];
                        }
                    } else {
                        tag[attrName] = currentAttr;
                    }
                }
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
        return document.createComment(str);
    };
    T.Text = function TText(str) {
        return document.createTextNode(""+str);
    };

}("T"); //please change better!
