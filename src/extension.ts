'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
var spawnCMD = require('spawn-command');

var process = null;
var fstarOutput = null;
var fstarInput = null;
var fstarLastCheck = new vscode.Position(0,0)

const verifiedCodeDecorationType = vscode.window.createTextEditorDecorationType({
        // verified code will be violet
		backgroundColor: 'rgba(130,10,210,0.3)'
	});

const erroneousLineDecorationType = vscode.window.createTextEditorDecorationType({
        // errors are marked red
		backgroundColor: 'rgba(255,0,0,0.3)'
	});
    

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Spawn the fstar process
    process = spawnCMD("fstar.exe --in");

    // This handles all output from the fstar process and displays is as info msg
    function printOutput(data) { 
     var editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; // No open text editor
        }

        var selection = editor.selection;
        var text = editor.document.getText(selection);

        // give visual feedback
        var response = data.toString();
        if (response.includes("#done-ok")) {
            // remove error decorations
            const erroneousLine: vscode.DecorationOptions[] = [];
            var docStart = new vscode.Position(0,0)
            const decorationOptEL = {
                range: new vscode.Range(docStart,docStart),
                hoverMessage: ""}
            erroneousLine.push(decorationOptEL);
            editor.setDecorations(erroneousLineDecorationType,erroneousLine);

            console.log('FStar: Verified OK');
            vscode.window.showInformationMessage('FStar: Veryfied OK');
            // set bg color
            const verifiedCode: vscode.DecorationOptions[] = [];
            const decorationOpt = {
                range: new vscode.Range(new vscode.Position(0,0),fstarLastCheck),
                hoverMessage: "Verified"}
            verifiedCode.push(decorationOpt);
            editor.setDecorations(verifiedCodeDecorationType,verifiedCode);
    } else {
            // remove bg color
            const verifiedCode: vscode.DecorationOptions[] = [];
            const decorationOptVC = {
                range: new vscode.Range(new vscode.Position(0,0),new vscode.Position(0,0)),
                hoverMessage: ""}
            verifiedCode.push(decorationOptVC);
            editor.setDecorations(verifiedCodeDecorationType,verifiedCode);
            
            // find erroneous line
            const regex = /\<input\>\((\d+),(\d+)-(\d+),(\d+)\)\:\s(.*)/;
            var errorTokens = regex.exec(response)

            if (errorTokens == null) {
                console.log('Error: Could not parse fstar response: ' + response);
                vscode.window.showInformationMessage('Error: Could not parse fstar response: ' + response);
                return                
            }

            // decorate erroneous line
            const erroneousLine: vscode.DecorationOptions[] = [];
            var errStart = new vscode.Position(parseInt(errorTokens[1])-1,parseInt(errorTokens[2]))
            var errStop = new vscode.Position(parseInt(errorTokens[3])-1,parseInt(errorTokens[4]))
            const decorationOptEL = {
                range: new vscode.Range(errStart,errStop),
                hoverMessage: errorTokens[5]}
            erroneousLine.push(decorationOptEL);
            editor.setDecorations(erroneousLineDecorationType,erroneousLine);

            console.log('FStar error in Line '+errorTokens[1]+': '+errorTokens[5]);
            vscode.window.showInformationMessage('FStar error in Line '+errorTokens[1]+': '+errorTokens[5]);
        }
           
    }
    process.stdout.on('data', printOutput);
    process.stderr.on('data', printOutput);

    // Verify the complete document
    let disposableComplete = vscode.commands.registerCommand('extension.verifyComplete', () => {
        // Get the code
        var code = vscode.window.activeTextEditor.document.getText();

        process.stdin.write("#push\n");
        process.stdin.write(code);
        process.stdin.write("\n#end #done-ok #done-nok\n");
        process.stdin.write("#pop\n");
    });

    // Verify until cursor
    let disposableToCursor = vscode.commands.registerCommand('extension.verifyToCursor', () => {
        // Get the cursor position
        var editor  = vscode.window.activeTextEditor;
        var cursorPos = editor.selection.active;
        var range = new vscode.Range(new vscode.Position(0,0),cursorPos);
        var code = editor.document.getText(range);

        // Save current position
        fstarLastCheck = cursorPos;

        process.stdin.write("#push\n");
        process.stdin.write(code);
        process.stdin.write("\n#end #done-ok #done-nok\n");
        process.stdin.write("#pop\n");
    });

    context.subscriptions.push(disposableComplete);
    context.subscriptions.push(disposableToCursor);
}

// this method is called when your extension is deactivated
export function deactivate() {
}