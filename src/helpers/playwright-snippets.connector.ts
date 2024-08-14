import * as vscode from "vscode";
import { showWarningMessage } from "./window-messages";
import { PwSnippetMap } from "./types";

const extensionName = "jaktestowac-pl.vsc-playwright-snippets";

export async function getPlaywrightExtensionSnippets(): Promise<PwSnippetMap> {
  return checkPlaywrightExtensionInstalled().then(async () => {
    const playwrightExtension = vscode.extensions.getExtension(extensionName);

    if (playwrightExtension === undefined) {
      showWarningMessage("Playwright Snippets extension not found.");
      return {};
    }

    const snippetsPath = playwrightExtension?.packageJSON.contributes.snippets;

    const packageJsonContent = await vscode.workspace.fs.readFile(
      vscode.Uri.joinPath(playwrightExtension.extensionUri, snippetsPath[0].path)
    );

    const snippets = JSON.parse(packageJsonContent.toString());

    return snippets;
  });
}

export async function checkPlaywrightExtensionInstalled(): Promise<void> {
  const extension = vscode.extensions.getExtension(extensionName);
  if (!extension) {
    const message =
      "It is recommended to install Playwright Snippets by jaktestowac.pl extension. Do you want to install it now?";
    const choice = await vscode.window.showInformationMessage(message, "Install", "Not now", "Do not show again");
    if (choice === "Install") {
      await vscode.commands.executeCommand("extension.open", extensionName); // open Extension tab and show extension details.
      await vscode.commands.executeCommand("workbench.extensions.installExtension", extensionName); // install the extension.
    } else {
      showWarningMessage("Some features may not work properly without the Playwright Snippets extension.");
    }
  }
}
