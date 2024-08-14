import * as vscode from "vscode";
import MyExtensionContext from "./helpers/my-extension.context";
import { SnippetsViewProvider } from "./providers/snippets-view.provider";
import { getPlaywrightExtensionSnippets } from "./helpers/playwright-snippets.connector";

export function activate(context: vscode.ExtensionContext) {
  MyExtensionContext.init(context);
  MyExtensionContext.instance.setWorkspaceState("workspaceFolders", vscode.workspace.workspaceFolders);

  const snippetsViewProvider = new SnippetsViewProvider(context.extensionUri, {});
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(SnippetsViewProvider.viewType, snippetsViewProvider)
  );
  getPlaywrightExtensionSnippets().then((snippets) => {
    snippetsViewProvider.refresh(snippets);
  });
}

// This method is called when your extension is deactivated
export function deactivate() {}
