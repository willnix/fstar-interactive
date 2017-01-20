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

### I recommend using [FiraCode](https://github.com/tonsky/FiraCode/wiki/VS-Code-Instructions) for ligatures
