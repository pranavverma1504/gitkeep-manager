const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

/**
 * Check if a folder is a leaf empty folder (recursively)
 * @param {string} folderPath
 * @param {Array} ignorePatterns
 * @param {string} gitkeepFileName
 * @returns {boolean}
 */
function isLeafEmptyFolder(folderPath, ignorePatterns, gitkeepFileName) {
    try {
        const items = fs.readdirSync(folderPath).filter(f => !ignorePatterns.includes(f));
        const files = items.filter(f => fs.statSync(path.join(folderPath, f)).isFile() && f !== gitkeepFileName);
        const folders = items.filter(f => fs.statSync(path.join(folderPath, f)).isDirectory());

        // If there are any real files, not empty
        if (files.length > 0) return false;

        // Recursively check subfolders
        for (const sub of folders) {
            const subPath = path.join(folderPath, sub);
            if (!isLeafEmptyFolder(subPath, ignorePatterns, gitkeepFileName)) {
                return false; // If any subfolder has real files, this folder is not empty
            }
        }

        return true; // No files and all subfolders are leaf empty
    } catch (err) {
        console.error(`Error checking folder ${folderPath}:`, err);
        return false;
    }
}

/**
 * Recursively get all folders in workspace
 */
function getAllFolders(dir, ignorePatterns) {
    let results = [];
    if (!fs.existsSync(dir)) return results;

    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        try {
            if (fs.statSync(fullPath).isDirectory()) {
                if (!ignorePatterns.includes(file)) {
                    results.push(fullPath);
                    results = results.concat(getAllFolders(fullPath, ignorePatterns));
                }
            }
        } catch (err) {
            console.error(`Error reading folder ${fullPath}:`, err);
        }
    }
    return results;
}

/**
 * Add .gitkeep to all leaf empty folders
 */
function addGitkeep() {
    const config = vscode.workspace.getConfiguration('gitkeep');
    const fileName = config.get('fileName') || '.gitkeep';
    const ignorePatterns = config.get('ignorePatterns') || [];

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showWarningMessage('No workspace folder open.');
        return;
    }

    let totalAdded = 0;

    workspaceFolders.forEach(folder => {
        const allFolders = getAllFolders(folder.uri.fsPath, ignorePatterns);
        allFolders.forEach(fld => {
            const gitkeepPath = path.join(fld, fileName);
            if (isLeafEmptyFolder(fld, ignorePatterns, fileName) && !fs.existsSync(gitkeepPath)) {
                try {
                    fs.writeFileSync(gitkeepPath, '');
                    totalAdded++;
                } catch (err) {
                    console.error(`Failed to create ${gitkeepPath}:`, err);
                }
            }
        });
    });

    vscode.window.showInformationMessage(`✅ Added ${fileName} to ${totalAdded} empty folders`);
}

/**
 * Setup watcher to auto-remove .gitkeep when folder gets a new file
 */
function setupWatcher(context) {
    const config = vscode.workspace.getConfiguration('gitkeep');
    const fileName = config.get('fileName') || '.gitkeep';
    const ignorePatterns = config.get('ignorePatterns') || [];

    const watcher = vscode.workspace.createFileSystemWatcher('**/*', false, false, false);

    watcher.onDidCreate(uri => {
        try {
            const parentDir = path.dirname(uri.fsPath);
            const gitkeepPath = path.join(parentDir, fileName);
            if (fs.existsSync(gitkeepPath) && !isLeafEmptyFolder(parentDir, ignorePatterns, fileName)) {
                fs.unlinkSync(gitkeepPath);
                console.log(`Removed ${fileName} from ${parentDir}`);
            }
        } catch (err) {
            console.error(`Error handling new file ${uri.fsPath}:`, err);
        }
    });

    context.subscriptions.push(watcher);
}

/**
 * Activate extension
 */
function activate(context) {
    console.log('Gitkeep extension is now active!');

    const disposable = vscode.commands.registerCommand('gitkeep.add', () => {
        addGitkeep();
    });
    context.subscriptions.push(disposable);

    setupWatcher(context);
}

/**
 * Deactivate extension
 */
function deactivate() {}

module.exports = {
    activate,
    deactivate
};
