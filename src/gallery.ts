import path from 'path';
import * as vscode from 'vscode';
import fs from 'fs/promises'
import { getCwd, getGlobPaths } from './utils/config';
import { SVGReg } from './utils/svg';


export const showGallery = async (context: vscode.ExtensionContext) => {
    const globPaths = getGlobPaths()
    if (!globPaths) {
        vscode.window.showWarningMessage('You have not set "spic.paths", If you want to check the SVG gallery, please set it to an array.')
        return
    }
    const panel = vscode.window.createWebviewPanel(
        'svg',
        'SVG Gallery',
        vscode.ViewColumn.One,
        {
            enableScripts: true
        }
    );
    const srcURL = panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'out/page/gallery/main.js')))
    panel.webview.html = getWebviewContent(srcURL);
    let a = 0
    const SVGFileContent = (await Promise.all(globPaths.map(filePath => fs.readFile(path.join(getCwd()!, filePath)))))
                            .map(buffer => buffer.toString().replaceAll(/\\r|\\n|\\t|\\/g, ""))
                            .filter(code => {
                                const hasSVG = SVGReg.test(code)
                                return hasSVG
                            })
    console.log(SVGFileContent)
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

