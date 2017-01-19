'use strict';

import * as vscode from 'vscode';
const spawn = require('child_process').spawn;
const dirname = require('path').dirname;
const endOfLine = require('os').EOL;

let fstarProcessList = {};
let currentBlockStartList = {};
let codeBlocks: Array<string>;
let currentBlockList = {};

const verifiedCodeDecorationType = vscode.window.createTextEditorDecorationType({
        // verified code will be violet
		backgroundColor: 'rgba(130,10,210,0.3)'
	});

const erroneousLineDecorationType = vscode.window.createTextEditorDecorationType({
        // errors are marked red
		backgroundColor: 'rgba(255,0,0,0.3)'
	});
    

export function activate(context: vscode.ExtensionContext) {
    // verify next block
    let disposableNextBlock = vscode.commands.registerCommand('extension.verifyNextBlock', () => {
        let editor  = vscode.window.activeTextEditor;
        let fileUri = editor.document.uri.toString()
        let fstarProcess = fstarProcessList[fileUri]
        let currentBlock = currentBlockList[fileUri]
        let currentBlockStart = currentBlockStartList[fileUri]
        // make sure everything is initialized
        if(typeof currentBlock === 'undefined') {
            currentBlock = 0;
            currentBlockList[fileUri] = currentBlock;
        }
        if(typeof currentBlockStart === 'undefined') {
            currentBlockStart = 0;
            currentBlockStartList[fileUri] = currentBlockStart;
        }
        // spawn the fstar process if it is not running
        if(typeof fstarProcess === 'undefined') {
            fstarProcess = spawn(vscode.workspace.getConfiguration('fstar')['exePath'], ["--in"], { cwd: dirname(vscode.window.activeTextEditor.document.fileName), shell: true});
            fstarProcessList[fileUri] = fstarProcess
            fstarProcess.on('error', (err) => {
                console.log('Error: '+err);
            });
        }

        // register handler to deal with fstars reponse
        fstarProcess.stdout.once('data', (data) => {
                processBlockResponse(data);
                // done with current block
                // next block starts 2 lines after the current one
                currentBlockStart += codeBlocks[currentBlock].split(endOfLine).length+2;
                currentBlockStartList[fileUri] = currentBlockStart;
                currentBlock++;
                currentBlockList[fileUri] = currentBlock;
                if(currentBlock>=codeBlocks.length) {
                    currentBlock = 0;
                    fstarProcess.kill()
                    delete fstarProcessList[fileUri]
                }
            });

        let code = editor.document.getText();
        // split code in blocks
        codeBlocks = code.split(endOfLine+endOfLine+endOfLine);
        // write next block
        fstarProcess.stdin.write("#push ${codeBlockStart}\n");
        fstarProcess.stdin.write(codeBlocks[currentBlock]);
        fstarProcess.stdin.write("\n#end #done-ok #done-nok\n");
       
    })

    // Verify until cursor
    let disposableToCursor = vscode.commands.registerCommand('extension.verifyToCursor', () => {
        let editor  = vscode.window.activeTextEditor;
        let fileUri = editor.document.uri.toString()
        let fstarProcess = fstarProcessList[fileUri]
        let currentBlock = currentBlockList[fileUri]
        let currentBlockStart = currentBlockStartList[fileUri]

         // make sure everything is initialized
        if(typeof currentBlock === 'undefined') {
            currentBlock = 0;
            currentBlockList[fileUri] = currentBlock;
        }
        if(typeof currentBlockStart === 'undefined') {
            currentBlockStart = 0;
            currentBlockStartList[fileUri] = currentBlockStart;
        }

        // until I figure out how to tell fstar to start over we kill any running proc and start a new one
        if(typeof fstarProcess !== 'undefined') {
            fstarProcess.kill()
            delete fstarProcessList[fileUri]
        }
        fstarProcess = spawn(vscode.workspace.getConfiguration('fstar')['exePath'], ["--in"], { cwd: dirname(vscode.window.activeTextEditor.document.fileName), shell: true});
        fstarProcessList[fileUri] = fstarProcess
        fstarProcess.on('error', (err) => {
            console.log('Error: '+err);
        });

        // register handler to deal with fstars reponse
        fstarProcess.stdout.on('data', (data) => {
            processBlockResponse(data);
            // done with current block
            // next block starts 2 lines after the current one
            currentBlockStart += codeBlocks[currentBlock].split(endOfLine).length+2;
            currentBlockStartList[fileUri] = currentBlockStart;
            currentBlock++;
            currentBlockList[fileUri] = currentBlock;

            nextBlock();
        });
        
        // Get the cursor position
        let cursorPos = editor.selection.active;
        let range = new vscode.Range(new vscode.Position(0,0),cursorPos);
        let code = editor.document.getText(range);

        // Split code in blocks
        codeBlocks = code.split(endOfLine+endOfLine+endOfLine);
        currentBlock = 0;
        // Write first block
        fstarProcess.stdin.write("#push\n");
        fstarProcess.stdin.write(codeBlocks[currentBlock]);
        fstarProcess.stdin.write("\n#end #done-ok #done-nok\n");

        // nextBlock() writes a block to the fstar process
        function nextBlock() {
            if(currentBlock<codeBlocks.length) {
                fstarProcess.stdin.write("#push\n");
                fstarProcess.stdin.write(codeBlocks[currentBlock]);
                // tell fstar we're done
                fstarProcess.stdin.write("\n#end #done-ok #done-nok\n");
            } else {
                // we're done
                fstarProcess.stdout.removeAllListeners('data')
            }
        }

    });

    context.subscriptions.push(disposableNextBlock);
    context.subscriptions.push(disposableToCursor);
}

// This handles all output from the fstar process
function processBlockResponse(data: string) :boolean { 
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
        return false; // No open text editor
    }
    let fileUri = editor.document.uri.toString()
    let currentBlock = currentBlockList[fileUri]
    let currentBlockStart = currentBlockStartList[fileUri]

    let response = data.toString();
    console.log(response)

    if (response.includes("#done-ok")) {
        // remove error decorations (there must be a better way)
        const erroneousLine: vscode.DecorationOptions[] = [];
        let docStart = new vscode.Position(0,0)
        const decorationOptEL = {
            range: new vscode.Range(docStart,docStart),
            hoverMessage: ""}
        erroneousLine.push(decorationOptEL);
        editor.setDecorations(erroneousLineDecorationType,erroneousLine);

        // inform the user of the success
        console.log('FStar: Verified OK');
        vscode.window.showInformationMessage('FStar: Veryfied OK');

        const verifiedCode: vscode.DecorationOptions[] = [];
        // define the block to be marked
        let blockEnd = new vscode.Position(currentBlockStart+codeBlocks[currentBlock].split(endOfLine).length,0);
        const decorationOpt = {
            range: new vscode.Range(docStart, blockEnd),
            hoverMessage: "Verified"}
        // apply the decoration
        verifiedCode.push(decorationOpt);
        editor.setDecorations(verifiedCodeDecorationType,verifiedCode);

        return true;
    } else {
        // remove bg color (there must be a better way)
        const verifiedCode: vscode.DecorationOptions[] = [];
        const decorationOptVC = {
            range: new vscode.Range(new vscode.Position(0,0),new vscode.Position(currentBlockStart-2,0)),
            hoverMessage: ""}
        verifiedCode.push(decorationOptVC);
        editor.setDecorations(verifiedCodeDecorationType,verifiedCode);

        // extract error position from fstars response
        const regex = /\<input\>\((\d+),(\d+)-(\d+),(\d+)\)\:\s(.*)/;
        let errorTokens = regex.exec(response)
        if (errorTokens == null) {
            console.log('Error: Could not parse fstar response: ' + response);
            vscode.window.showInformationMessage('Error: Could not parse fstar response: ' + response);
            return false;                
        }

        // inform the user of the error
        console.log('FStar error in Line '+errorTokens[1]+': '+errorTokens[5]);
        vscode.window.showInformationMessage('FStar error in Line '+errorTokens[1]+': '+errorTokens[5]);
        
        // decorate erroneous area
        const erroneousLine: vscode.DecorationOptions[] = [];
        // define the area to be marked according to fstars output
        let errStart = new vscode.Position(parseInt(errorTokens[1])+currentBlockStart-1,parseInt(errorTokens[2]))
        let errStop = new vscode.Position(parseInt(errorTokens[3])+currentBlockStart-1,parseInt(errorTokens[4]))
        const decorationOptEL = {
            range: new vscode.Range(errStart,errStop),
            hoverMessage: errorTokens[5]}
        // apply the decoration
        erroneousLine.push(decorationOptEL);
        editor.setDecorations(erroneousLineDecorationType,erroneousLine);

        return false;
    }
        
}

// this method is called when your extension is deactivated
export function deactivate() {
    Object.keys(fstarProcessList).forEach((key) => {
        fstarProcessList[key].kill()
    })
}