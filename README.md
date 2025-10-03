# Gitkeep VS Code Extension

## Overview
Gitkeep helps you manage empty folders in your projects by automatically adding a `.gitkeep` file to empty folders and removing it when new files are added. This ensures that all empty folders are tracked in Git repositories.

---

## Features
- Adds `.gitkeep` automatically to all empty folders.
- Removes `.gitkeep` automatically when a new file is added to a folder.
- Respects ignored folders such as `node_modules`, `.git`, `.vscode`, `dist`, and `build`.
- Works recursively for nested empty folders.
- Customizable `.gitkeep` file name and ignored folder patterns.

---

## Requirements
- Visual Studio Code version 1.104.0 or higher.

---

## Extension Settings
This extension contributes the following settings:

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `gitkeep.fileName` | string | `.gitkeep` | Name of the file used for empty folders. |
| `gitkeep.ignorePatterns` | array | `["node_modules", ".git", ".vscode", "dist", "build"]` | List of folders to ignore when adding `.gitkeep`. |

---

## Usage
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) to open the Command Palette.
2. Search for **Gitkeep: Add .gitkeep to empty folders** and execute the command.
3. `.gitkeep` files will be added to all empty folders in your workspace.
4. When you create a new file inside a folder that has `.gitkeep`, the `.gitkeep` file is automatically removed.

---

## Release Notes

### 1.0.0
- Initial release.
- Adds `.gitkeep` to empty folders.
- Removes `.gitkeep` automatically when new files are added.
