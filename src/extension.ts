import * as vscode from "vscode";
import MyExtensionContext from "./helpers/my-extension.context";
import { SnippetsViewProvider } from "./providers/snippets-view.provider";
import { getPlaywrightExtensionSnippets } from "./helpers/playwright-snippets.connector";
import { EXTENSION_NAME } from "./helpers/consts";
import { showInformationMessage } from "./helpers/window-messages";

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

  registerCommand(context, `${EXTENSION_NAME}.copySelectedSnippet`, (params) => {
    if (params.key === undefined) {
      showInformationMessage("Click on the snippet to copy it.");
      return;
    }
    snippetsViewProvider.copySnippet(params.key);
  });
}

// This method is called when your extension is deactivated
export function deactivate() {}

export function registerCommand(context: vscode.ExtensionContext, id: string, callback: (...args: any[]) => any) {
  let disposable = vscode.commands.registerCommand(id, callback, context);
  context.subscriptions.push(disposable);
}
