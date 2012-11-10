/**
 * documentの再現モジュール
 * 文字列化する能力しか持っていません
 */

//-- utility -------------------------
var create = Object.create;
function object(o) {
    var n=create(o), i=1, l=arguments.length, p;
    for (; i<l; ++i)
        for (p in arguments[i])
            n[p] = arguments[i][p];
    return n;
}

function mix(proto) {
    var i=1, l=arguments.length, p, mixin;
    for (; i<l; ++i) {
        mixin = arguments[i];
        for (p in mixin) {
            proto[p] = mixin[p];
        }
    }
}


//-- classes --------------------------

/**
 * class Element
 *
 */
function Element(name, children) {
    this._name = name;
    this._children = children || [];
}
Element.prototype = {
    constructor: Element,

    nodeType: 1,

    appendChild: function(node){
        this._children.push(node);
    },

    cloneNode: function(){
        var i,l,cur;
        var elem = new Element(this._name, this._children.concat());
        for (i=0,l=elem._children.length; i<l; i++) {
            cur = elem._children[i];
            if (cur instanceof Element) {
                elem._children[i] = cur.cloneNode();
            }
        }
        return elem;
    },

    toString: function(){
        var children;
        if (this._children.length) {
            children = this._children.map(function(v){return ""+v});
            return '<'+this._name + this._attributes() + '>'
                 + children.join('')
                 + '</'+this._name+'>';
        } else {
            return '<'+this._name+' />';
        }
    },

    _attributes: function(){
        var attrs = [''], p;
        for (p in this) switch (p) {
            case 'nodeType': case 'cloneNode':
            case 'toString': case 'appendChild':
            case '_name': case '_attributes':
            case 'constructor':
            case '_children':
                break;
            case 'className':
                attrs.push('class="' + escapeAttr(this[p]) + '"');
                break;
            case 'htmlFor':
                attrs.push('for="' + escapeAttr(this[p]) + '"');
                break;
            default:
                attrs.push(p + '="' + escapeAttr(this[p]) + '"');
        }
        return attrs.join(' ');
    }
};


/**
 * class DocumentFragment
 *
 */
function DocumentFragment() {
    Element.call(this, null);
}
DocumentFragment.prototype = object(Element.prototype, {
    constructor: DocumentFragment,

    nodeType: 11,

    toString: function() {
        if (this._children.length) {
            return this._children.map(function(v){
                return ""+v;
            }).join('');

        } else {
            return '';

        }
    }

});


/**
 * class Comment
 *
 */
function Comment(text) {
    this._text = text;
}
Comment.prototype = {
    constructor: Comment,

    nodeType: 8,

    toString: function(){
        return '<!--' + this._text + '-->';
    }
};

//-- escaper ---------------------------------
function escapeElement(str) {
    return (""+str).replace(/[&<>]/g, function($0){
        return escapeElement.dic[$0];
    });
}
escapeElement.dic = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;"
};

function escapeAttr(str) {
    return (""+str).replace(/[&<>"]/g, function($0){
        return escapeAttr.dic[$0];
    });
}
escapeAttr.dic = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;"
};


//-- exports ---------------------------------
this.createElement = function(name){
    var el = new Element(name);
//    console.log(el.constructor.name);
    return el;
};

this.createTextNode = escapeElement;

this.createDocumentFragment = function(){
    return new DocumentFragment;
};

this.createComment = function(str){
    return new Comment(str);
};
