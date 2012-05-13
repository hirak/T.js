T.js
=======

DOMBuilder-like template engine for JavaScript

T.jsはJavaScriptでのDOMの構築をより短く書けるようにする、ラッパー関数集です。
簡易的なテンプレートエンジンとして使うことができます。

## 特徴
* Independent. 特定のライブラリに依存しません。
* Lightweight. minified & gzip で1.8kBほどです。
* Pure JavaScript. 独自文法を用意せず、可能な限り短く書けるように設計しました。
* MIT Licence. -> LICENSE.md

* 消費するグローバル変数名は"T"です。必要に応じて書き換えることも可能です。

## Sample

```javascript
T.Shorthand();

with(T) var template =
DocumentFragment(
    div("#header")(
        h1("Head Text 1")),
    div("#content")(
        h2("Head Text 2"),
        p(
            "description",
            a({href:"http://github.com/"}, "a tag test")),
        ul(
            li("menu1"),
            li("menu2"),
            li("menu3"))),
    div("#footer")(
        address("sample@sample.com")));

document.body.appendChild(template);
```

## How
T.jsを読み込むと使えるようになります。

```html
<script src="T.js"></script>
```

より短く書くために、省略記法の登録を推奨しています。
Shorthand()に渡したタグリストは次から短く書くことができます。

```javascript
T.Shorthand("a div p span br");
T.Shorthand.html4(); //html4 only elements enable
T.Shorthand.html5(); //html5 only elements enable
T.Shorthand.full();  //html4 + html5 + head enable
```

引数を省略した場合、通常よく使われるタグが登録されます。

```javascript
T.Shorthand();
```

## Syntax

### 基本

T(tagname, content, ...) が基本形です。

```javascript
T("div","text data")
```

```html
<div>text data</div>
```

T.Shorthand()で初期化してあると、さらに短く書けるようになります。
以降はこちらの書き方で説明します。

```javascript
T.div("text data")
```

```html
<div>text data</div>
```

入れ子にできます。

```javascript
T.div(T.p("paragraph"))
```

```html
<div><p>paragraph</p></div>
```

引数は可変長です。

```javascript
T.ul(
    T.li("1"),
    T.li("2"),
    T.li("3"),
    ...
    T.li("10"))
```

配列やHTMLCollectionを混ぜることができます。
機械的に複数の要素を作る場合に便利です。

```javascript
T.ul(
    T.li("1"),
    [T.li("2"), T.li("3")],
    ...
    T.li("10"))
```


attributeは第一引数にオブジェクト形式で渡します。

```javascript
T.div({id:"main"}, "content")
```

```html
<div id="main">content</div>
```

classは"className"、forは"htmlFor"と書く必要があるので注意が必要です。

```javascript
T.div({className:"entry"}, "content")
```

```html
<div class="entry">content</div>
```

```javascript
label({htmlFor:"email"},
    "E-mail",
    input({type:"text", name:"email"}))
```

```html
<label for="email">
  E-mail
  <input type="text" name="email">
</label>
```


### 特別な関数

#### T.DocumentFragment()
document.createDocumentFragment()のラッパーです。

```javascript
T.div(
    T.DocumentFragment(
        T.p("content1"),
        T.p("content2"),
        T.p("content3")))
```
他の要素と同じく可変長引数を渡すことができます。

#### T.DF()
T.DocumentFragment()のエイリアスです。短く書きたいときに使ってください。

#### T.Text()
document.createTextNode()のラッパーです。

```javascript
T.Text("text node")
// -> document.createTextNode("text node")
```


#### T.Comment()
document.createComment()のラッパーです。

```javascript
T.Comment("comment")
// -> <!--comment-->
```

### 応用

with statementを併用すると更に短く書くことができます。
ただし、i(), a(), b()といった名前の関数ができてしまうため、よく使われる変数と
見分けがつきにくくなってしまいます。なので常用は推奨しません。

```javascript
with(T) var template =
DF(
    h2("h2 text"),
    p("description"),
    ul(
        li("menu1"),
        li("menu2"),
        li("menu3")));
```

idとclassNameはよく使うので、CSS Selector likeな省略記法を用意してあります。

```javascript
//id -> "#id"
T.div({id:"main"},"main content")
//↓
T.div("#main")("main content")

//className -> ".class"
T.div({className:"entry current"},"entry content")
//↓
T.div(".entry.current")("entry content")

//combination
T.div({id:"main",className:"entry current"},"entry content")
//↓
T.div("#main.entry.current")("entry content")
```

この機能のため、思ったように要素が作れない場合があります。
その場合はT.Textでテキストノードにしてから渡してください。

```javascript
T.div("#main.entry"); // ->function

T.div(T.Text("#main.entry")); //<div>#main.entry</div>
```

### Helper
テンプレートを書きやすくするためのヘルパー関数を用意してあります。

#### T.$nest(callback1 [, callback2, ...])
複数の関数を引数に取り、入れ子に組み合わせた新たな関数を返します。これ単独で使うより、以下のmapと併用することを想定しています。

```javascript
var nestedTemplate = T.$nest(T.li, T.strong, T.span(".foo"));
nestedTemplate("aaaa"); //<li><strong><span class="foo">aaaa</span></strong></li>

//equal code
var nestedTemplate = function(){
    return T.li(
            T.strong(
             T.span(".foo")(
              Array.prototype.slice.call(arguments))));
};
```

#### T.$(array).chunk(count [, pad])
T.$()でArrayをくくると、.mapおよび.chunkというメソッドが増えます。
.chunkは指定した大きさで配列を分割します。PHPのarray_chunk()に相当します。

```javascript
T.$([1,2,3,4,5,6]).chunk(2); //[ [1,2] ,[3,4], [5,6] ]
T.$([1,2,3,4,5,6]).chunk(3); //[ [1,2,3], [4,5,6] ]
```

padに何か値を設定しておくと、最後の余った部分をpadの値で埋めます。
デフォルトでは埋めません。

```javascript
T.$([1,2,3,4]).chunk(3);     //[ [1,2,3], [4] ]
T.$([1,2,3,4]).chunk(3, ''); //[ [1,2,3], [4,'',''] ]
```

#### T.$(array).map(callback [, callback2, callback3, ...])
Array.prototype.mapではいくつかの引数をcallbackに渡してしまうため、T.jsとの相性がよくありません。
ヘルパーのmap関数では機能を大幅に拡張しました。

基本的には配列のすべての要素に対してcallbackを適用します。

```javascript
T.$([1,2,3]).map(T.li);      //<li>1</li><li>2</li><li>3</li>
```

callbackは関数だけでなく、HTMLNodeを渡すこともできます。この場合、渡したHTMLNodeをひな形にして関数を作ります。クラスを指定するのに便利です。

```javascript
T.$([1,2]).map(T.li(".list"));  //<li class="list">1</li><li class="list">2</li>
```

入れ子になった配列に対し、複数のcallbackを指定できます。<table>を作るのに便利です。

```javascript
var data = [
    [1,2,3],
    [4,5,6]
];
with(T) var tpl =
table(
    $(data).map(tr, td));
/*
<table>
  <tr>
    <td>1</td><td>2</td><td>3</td>
  </tr>
  <tr>
    <td>4</td><td>5</td><td>6</td>
  </tr>
</table>
*/
```

callbackを配列にして渡すと、順番に適用するようになります。偶数・奇数での出し分けなどに使えます。

```javascript
T.$([1,2,3,4,5]).map([T.li(".odd"), T.li(".even")]);
/*
<li class="odd">1</li>
<li class="even">2</li>
<li class="odd">3</li>
<li class="even">4</li>
<li class="odd">5</li>
*/
```

callbackを以下のようなオブジェクトにして渡すと、最初と最後に特別な出し分けをすることができます。middleだけ必須です。

```javascript
T.$([1,2,3,4,5]).map({
  first: T.li(".first"),
  middle:T.li,
  last:  T.li(".last")
});
/*
<li class="first">1</li>
<li>2</li>
<li>3</li>
<li>4</li>
<li class="last">5</li>
*/
```

### グローバル変数名を変更する
デフォルトでは"T"を消費します。
T.jsの最終行を書き換えると、グローバル変数名を好きなものに変えることができます。

```javascript
}("T"); //please change better!

// ↓

}("MarkupBuilder");

//-----------------
MarkupBuilder.div("hoge")
```

## 謝辞
T.jsは私が一から作ったのではなく、nektixe氏のソースが元になっています。
再配布を快諾してくださったnektixe氏に心より感謝いたします。

Original Code: http://code.nanigac.com/source/view/427

