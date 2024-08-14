import * as vscode from "vscode";

export function showErrorMessage(message: string): void {
  vscode.window.showErrorMessage(`Snippets: ${message}`);
}

export function showInformationMessage(message: string): void {
  vscode.window.showInformationMessage(`Snippets: ${message}`);
}

export function showWarningMessage(message: string): void {
  vscode.window.showWarningMessage(`Snippets: ${message}`);
}
