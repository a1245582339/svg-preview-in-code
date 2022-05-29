import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import * as glob from 'glob'
import path = require('path');
import * as vscode from 'vscode';
export function activate(context: vscode.ExtensionContext) {
	let timeout: NodeJS.Timer | undefined = undefined;
	const configPaths = vscode.workspace.getConfiguration('spic').get<string[]>('paths')
	let activeEditor = vscode.window.activeTextEditor;
	let globPaths: string[] = []
	const cwd = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0].uri.fsPath
	if (configPaths && configPaths instanceof Array && cwd) {
		globPaths = Array.from(new Set(configPaths.map(path => glob.sync(path, {
			cwd
		})).flat()))
	}
	const svgPreviewDecorationType = vscode.window.createTextEditorDecorationType({
		after: {}
	});
	
	function updateDecorations() {
		if (!activeEditor) {
			return;
		}
		if (configPaths && !globPaths.some(globPath => path.join(cwd!, globPath) === activeEditor!.document.uri.fsPath)) {
			return
		}
		
		const regEx = /<svg .*?>[\s\S]*?<\/svg>/g;
		const text = activeEditor.document.getText();
		const svgPreviews: vscode.DecorationOptions[] = [];
		let match;
		while ((match = regEx.exec(text))) {
			const startPos = activeEditor.document.positionAt(match.index);
			const endPos = activeEditor.document.positionAt(match.index + match[0].length);
			let svg = match[0]

			const parser = new XMLParser({
				ignoreAttributes: false,
        		attributeNamePrefix : "@_",
			});
			const builder = new XMLBuilder(
				{
					ignoreAttributes: false,
					attributeNamePrefix : "@_",
				}
			);
			const svgObj = parser.parse(svg);
			const fontSize = vscode.workspace.getConfiguration('editor').get('fontSize')
			const originalSize = {height: svgObj.svg['@_height'], width: svgObj.svg['@_width']}
			svgObj.svg['@_width'] = fontSize
			svgObj.svg['@_height'] = fontSize
			const decorationSvg = builder.build(svgObj)
			const hoverBase64 = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
			const decorationBase64 = `data:image/svg+xml;base64,${Buffer.from(decorationSvg).toString('base64')}`
			const hoverMessage = new vscode.MarkdownString(`![svg](${hoverBase64}|width=50)\n\n${originalSize.width}×${originalSize.height}`)
			const decoration: vscode.DecorationOptions = {
				range: new vscode.Range(startPos.line, startPos.character, endPos.line, endPos.character),
				hoverMessage,
				renderOptions: {
					before: {
						contentIconPath: vscode.Uri.parse(decorationBase64),
						height: vscode.workspace.getConfiguration('editor').get('fontSize')
					},
				},
			};
			svgPreviews.push(decoration);
		}
		activeEditor.setDecorations(svgPreviewDecorationType, svgPreviews);
	}

	function triggerUpdateDecorations(throttle = false) {
		if (timeout) {
			clearTimeout(timeout);
			timeout = undefined;
		}
		if (throttle) {
			timeout = setTimeout(updateDecorations, 500);
		} else {
			updateDecorations();
		}
	}

	if (activeEditor) {
		triggerUpdateDecorations();
	}
	vscode.window.onDidChangeActiveTextEditor(editor => {
		activeEditor = editor;
		if (editor) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		if (activeEditor && event.document === activeEditor.document) {
			triggerUpdateDecorations(true);
		}
	}, null, context.subscriptions);
}