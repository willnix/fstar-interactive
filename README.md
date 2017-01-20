# fstar-interactive
F\* support for vistual studio code
It is and probably will allways be very hacky, but I'm too stupid for emacs so I hope this'll work better for me.

## progress
- Syntax highlighting is a blunt rip-off of the vscode ocaml plugin [works better than expected]
- Processing with fstar's interactive mode is possible
- The file is processed from the beginning every time
- Succesful runs will mark the processed code violet
- Errors will be highlighted in the code and hover text will show the error message

| Keys           |Action                                      |
|----------------|--------------------------------------------|
|``CTRL+ALT+C``  | Process the file up to the cursor position |
|``CTRL+ALT+D``  | Process next block                     	  |
|``CTRL+ALT+R``  | Reset everything                   	      |

## ligatures
- Install the ``prettify-symbols-mode`` extension
- Add the following lines to your user ``settings.json``:
```javascript
{
    "prettifySymbolsMode.revealOn": "cursor",
    "prettifySymbolsMode.adjustCursorMovement": true,
    "prettifySymbolsMode.substitutions": [{
    "language": "fstar",
    "substitutions": [
        { "ugly": "\\*", "pretty": "×", "pre": "\\b", "post": "\\b" },
        { "ugly": "~>", "pretty": "↝", "pre": "\\b", "post": "\\b" },
        { "ugly": "<=", "pretty": "≤", "pre": "\\b", "post": "\\b" },
        { "ugly": ">=", "pretty": "≥", "pre": "\\b", "post": "\\b" },
        { "ugly": "::", "pretty": "⸬", "pre": "\\b", "post": "\\b" },
        { "ugly": "/\\\\", "pretty": "∧"},
        { "ugly": "\\\\/", "pretty": "∨"},
        { "ugly": "~", "pretty": "¬"},
        { "ugly": "<>", "pretty": "≠"},
        { "ugly": "&&", "pretty": "∧"},
        { "ugly": "\\|\\|", "pretty": "∨"},
        { "ugly": "=!=", "pretty": "≠"},
        { "ugly": "<==>", "pretty": "⟺"},
        { "ugly": "==>", "pretty": "⟹"},
        { "ugly": "=>", "pretty": "⇒"},
        { "ugly": "->", "pretty": "→"},
        { "ugly": "sqrt\\s?",      "pretty": "√", "pre": "\\b", "post": "\\b" },
        { "ugly": "'a", "pretty": "α", "pre": "\\b", "post": "\\b" },
        { "ugly": "'b", "pretty": "β", "pre": "\\b", "post": "\\b" },
        { "ugly": "'c", "pretty": "γ", "pre": "\\b", "post": "\\b" },
        { "ugly": "'d", "pretty": "δ", "pre": "\\b", "post": "\\b" },
        { "ugly": "'e", "pretty": "ϵ", "pre": "\\b", "post": "\\b" },
        { "ugly": "nat", "pretty": "ℕ", "pre": "\\b", "post": "\\b" },
        { "ugly": "int", "pretty": "ℤ", "pre": "\\b", "post": "\\b" },
        { "ugly": "fun", "pretty": "λ", "pre": "\\b", "post": "\\b" },
        { "ugly": "->",  "pretty": "→", "pre": "[^->]", "post": "[^->]" },
        { "ugly": "forall", "pretty": "∀", "pre": "\\b", "post": "\\b" },
        { "ugly": "exists", "pretty": "∃", "pre": "\\b", "post": "\\b" },
        { "ugly": ">>",  "pretty": "≫", "pre": "[^=<>]|^", "post": "[^=<>]|$" },
        { "ugly": "<<",  "pretty": "≪", "pre": "[^=<>]|^", "post": "[^=<>]|$" },
        { "ugly": "\\|", "pretty": "║", "pre": "^\\s+", "post": "^\\|" },
        { "ugly": "True", "pretty": "⊤", "pre": "\\b", "post": "\\b" },
        { "ugly": "True", "pretty": "⊥", "pre": "\\b", "post": "\\b" }
       ]}]
}
```
*NOTE: This rules will be provided by fstar-interactive in the future*
