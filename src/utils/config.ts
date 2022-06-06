import * as vscode from 'vscode';
import * as glob from 'glob'

export const getGlobPaths = () => {
    const include = vscode.workspace.getConfiguration('spic').get<string[]>('include')
    const exclude = vscode.workspace.getConfiguration('spic').get<string[]>('exclude')
    if (!include && !exclude) {
        return null
    }
    let includeGlobPaths: string[] = []
    const cwd = getCwd()
	if (include && include instanceof Array && cwd) {
		includeGlobPaths = Array.from(new Set(include.map(path => glob.sync(path, {
			cwd, 
            ignore: exclude?.map(pattern => /\/\*\*$/.test(pattern) ? pattern : `${pattern}/**`)
		})).flat()))
	}
    return includeGlobPaths
}

export const getCwd = () => {
    return vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0].uri.fsPath

}