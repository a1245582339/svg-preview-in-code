import path = require('path');
import * as vscode from 'vscode';
import { showGallery } from './gallery';
import { getCwd, getGlobPaths } from './utils/config';
import { removeEscape, svg2Base64, SVGReg } from './utils/svg';
export function activate(context: vscode.ExtensionContext) {
	let timeout: NodeJS.Timer | undefined = undefined;
	let activeEditor = vscode.window.activeTextEditor;
	const globPaths = getGlobPaths()
	const svgPreviewDecorationType = vscode.window.createTextEditorDecorationType({});
	context.subscriptions.push(
		vscode.commands.registerCommand('spic.gallery', async () => {
			showGallery(context)
		})
	);
	const cwd = getCwd()
	function updateDecorations() {
		if (!activeEditor) {
			return;
		}
		if (globPaths && !globPaths.some(globPath => path.join(cwd!, globPath) === activeEditor!.document.uri.fsPath)) {
			return
		}

		const text = activeEditor.document.getText();
		const svgPreviews: vscode.DecorationOptions[] = [];
		let match;
		while (match = SVGReg.exec(text)) {
			const startPos = activeEditor.document.positionAt(match.index);
			const endPos = activeEditor.document.positionAt(match.index + match[0].length);
			let svg = removeEscape(match[0])
			const fontSize = vscode.workspace.getConfiguration('editor').get('fontSize') as number
			const decorationBase64Result = svg2Base64(svg, {height: fontSize, width: fontSize})
			const hoverBase64Result = svg2Base64(svg)
			const hoverMessage = new vscode.MarkdownString(`![svg](${hoverBase64Result.base64}|width=50)\n\n${hoverBase64Result.originalSize.width}×${hoverBase64Result.originalSize.height}`)
			const decoration: vscode.DecorationOptions = {
				range: new vscode.Range(startPos.line, startPos.character, endPos.line, endPos.character),
				hoverMessage,
				renderOptions: {
					before: {
						contentIconPath: vscode.Uri.parse(decorationBase64Result.base64),
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