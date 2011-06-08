T.js
=======

DOMBuilder-like template engine for JavaScript

T.jsはJavaScriptでのDOMの構築をより短く書けるようにする、ラッパー関数集です。
簡易的なテンプレートエンジンとして使うことができます。

## 特徴
* Independent. 特定のライブラリに依存しません。
* Lightweight. 圧縮版で2kBほどです。
* Pure JavaScript. 独自文法を用意せず、可能な限り短く書けるように設計しました。
* MIT Licence.

* 消費するグローバル変数名は"T"です。必要に応じて書き換えることも可能です。

## Sample

    ```JavaScript
    with(T) var template =
    DocumentFragment(
        div({id:"header"},
            h1("Head Text 1")),
        div({id:"content"},
            h2("Head Text 2"),
            p(
                "description",
                a({href:"http://github.com/"}, "a tag test")),
            ul(
                li("menu1"),
                li("menu2"),
                li("menu3"))),
        div({id:"footer"},
            address("sample@sample.com")))
    ;

    document.body.appendChild(template);
    ```

## How
T.jsを読み込むと使えるようになります。

    <script src="T.js"></script>

より短く書くために、省略記法の登録を推奨しています。
Shorthand()に渡したタグリストは次から短く書くことができます。

    ```JavaScript
    T.Shorthand("a div p span br");
    T.Shorthand.head();  //<html><head><title> etc enable
    T.Shorthand.html4(); //html4 only elements enable
    T.Shorthand.html5(); //html5 only elements enable
    T.Shorthand.full();  //html4 + html5 + head enable
    ```

引数を省略した場合、通常よく使われるタグが登録されます。

    ```JavaScript
    T.Shorthand();
    ```

## Syntax

### 基本

    T("div","text data")
    ↓
    <div>text data</div>

しかしShorthand()で初期化してあると、こう書けるようになります。
Shorthandを推奨します。以降はこちらの書き方で説明します。

    T.div("text data")
    ↓
    <div>text data</div>

入れ子にできます。

    T.div(T.p("paragraph"))
    ↓
    <div><p>paragraph</p></div>

引数は可変長です。

    T.ul(
        T.li("1"),
        T.li("2"),
        T.li("3"),
        ...
        T.li("10"))

配列やHTMLCollectionを混ぜると、平準化されてからパースされます。
機械的に複数の要素を作る場合に便利です。

    T.ul(
        T.li("1"),
        [T.li("2"), T.li("3")],
        ...
        T.li("10"))


Attributeは第一引数にオブジェクト形式で渡します。

    T.div({id:"main"}, "content")
    ↓
    <div id="main">content</div>

classは"className"、forは"htmlFor"と書く必要があるので注意が必要です。

    T.div({className:"entry"}, "content")
    ↓
    <div class="entry">content</div>

    label({htmlFor:"email"},
        "E-mail",
        input({type:"text", name:"email"}))
    ↓
    <label for="email">
      E-mail
      <input type="text" name="email">
    </label>


### 特別な関数

* T.DocumentFragment()
document.createDocumentFragment()のラッパーです。
他の要素と同じく可変長引数を渡すことができます。
* T.DF()
T.DocumentFragment()のエイリアスです。
* T.Text()
document.createTextNode()のラッパーです。
* T.Comment()
document.createComment()のラッパーです。

### 応用

with statementを併用すると更に短く書くことができます。

    ```JavaScript
    with(T) var template =
    DocumentFragment(
        h2("h2 text"),
        p("description"),
        ul(
            li("menu1"),
            li("menu2"),
            li("menu3")));


