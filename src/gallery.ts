import path from 'path';
import * as vscode from 'vscode';
import fs from 'fs/promises'
import { getCwd, getGlobPaths } from './utils/config';
import { removeEscape, svg2Base64, SVGReg } from './utils/svg';


export const showGallery = async (context: vscode.ExtensionContext) => {
    const globPaths = getGlobPaths()
    if (!globPaths) {
        vscode.window.showWarningMessage('You have not set "spic.include" or "spic.exclude", If you want to check the SVG gallery, please set it to an array.')
        return
    }
    
    const panel = vscode.window.createWebviewPanel(
        'svg',
        'SVG Gallery',
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            retainContextWhenHidden: true
        }
    );
    const srcURL = panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'out/page/gallery/main.js')))
    panel.webview.html = getWebviewContent(srcURL);
    const SVGFileContent = (await Promise.all(globPaths.map(filePath => fs.readFile(path.join(getCwd()!, filePath)))))
        .map((buffer, index) => {
            const fileStr = buffer.toString('utf-8')
            let match;
            const matches = []
            while (match = SVGReg.exec(fileStr)) {
                const { index } = match
                matches.push({
                    ...svg2Base64(removeEscape(match[0]), { height: 40, width: 40 }),
                    index
                })
            }
            return { path: globPaths[index], matches }
        })
        .filter(item => item.matches && item.matches.length)
    panel.webview.onDidReceiveMessage(
        message => {
            switch (message.command) {
                case 'request_data':
                    panel.webview.postMessage({
                        command: "svg_data",
                        data: SVGFileContent
                    })
                    return;
                case 'open_file':
                    vscode.window.showTextDocument(vscode.Uri.file(path.resolve(
                        path.join(getCwd()!, message.data.path)
                    ))).then(editor => {
                        const pos = editor.document.positionAt(message.data.index)
                        editor.selections = [new vscode.Selection(pos, pos)];
                        var range = new vscode.Range(pos, pos);
                        editor.revealRange(range);
                    }, () => {
                        vscode.window.showErrorMessage('Oops! Unable to open the file.');
                    });
                    return;
            }
        },
        undefined,
        context.subscriptions
    );
    panel.webview.postMessage({
        command: "svg_data",
        data: SVGFileContent
    })
}



function getWebviewContent(srcURL: vscode.Uri) {
    return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cat Coding</title>
  </head>
  <body>
      <div id="root"></div>
      <script src="${srcURL}"></script>
  </body>
  </html>`;
}

