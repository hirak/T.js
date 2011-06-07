T.js
=======

A DOM wrapper / JavaScript Template Engine
------

## Sample

    T.Shorthand();

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

## How

    <script src="T.js"></script>

enjoy!
test commit
