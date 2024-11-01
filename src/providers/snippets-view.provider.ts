import * as vscode from "vscode";
import { formatSnippet, getNonce } from "../helpers/helpers";
import { svgAddSnippetIcon, svgAddSnippetIconSimple, svgSnippetIcon } from "../helpers/icons";
import { PwSnippet, PwSnippetListMap, PwSnippetMap } from "../helpers/types";
import { showErrorMessage, showInformationMessage } from "../helpers/window-messages";

export class SnippetsViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "playwright-snippets-ui.snippets";

  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri, private _snippetsList: PwSnippetMap) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((data) => {
      switch (data.type) {
        case "invokeSnippet": {
          this.invokeSnippet(data.key);
          break;
        }
      }
    });
  }

  private invokeSnippet(snippetKey: string) {
    let snippetCode = undefined;
    for (const snippetName in this._snippetsList) {
      if (this._snippetsList[snippetName].prefix === snippetKey) {
        snippetCode = this._snippetsList[snippetName].body;
        break;
      }
    }

    if (snippetCode === undefined) {
      showErrorMessage(`Snippet ${snippetKey} not found. Please refresh the snippets list.`);
      return;
    }

    const snippetString = snippetCode.join("\n") + "\n";

    vscode.commands.executeCommand("editor.action.insertSnippet", { snippet: snippetString }).then(
      (val) => {
        // do nothing
      },
      (reason) => {
        showErrorMessage(`Error invoking snippet ${snippetKey}: ${reason}`);
      }
    );
  }

  public copySnippet(snippetName: string) {
    console.log("copySnippet", snippetName);
    const snippet = Object.values(this._snippetsList).find((snippet) => snippet.prefix === snippetName);
    console.log("copySnippet", snippet);
    if (snippet === undefined) {
      return vscode.env.clipboard.writeText("");
    }
    const formattedSnippet = formatSnippet(snippet);

    vscode.env.clipboard.writeText(formattedSnippet);
  }

  public refresh(scripts: PwSnippetMap) {
    this._snippetsList = scripts;
    if (this._view !== undefined) {
      this._view.webview.html = this._getHtmlForWebview(this._view.webview);
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "resources", "snippets.js"));
    const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "resources", "vscode.css"));
    const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "resources", "main.css"));

    const snippetsPerCategory: PwSnippetListMap = {};
    let categoriesSorted = [];
    for (const snippet in this._snippetsList) {
      const snippetObj = this._snippetsList[snippet];

      const category = snippetObj.category ?? "Other";

      if (!(category in snippetsPerCategory)) {
        snippetsPerCategory[category] = [];
      }
      snippetsPerCategory[category].push(snippetObj);
      categoriesSorted.push(category);
    }

    categoriesSorted = [...new Set(categoriesSorted)];

    let controlsHTMLList = ``;
    categoriesSorted = categoriesSorted.sort();

    for (const category of categoriesSorted) {
      const snippetsInCategory = snippetsPerCategory[category];

      controlsHTMLList += `<h4 style="text-align: center !important;" aria-label="${category}" id="id-${category}" category="${category}" class="collapsible nav-list__title">> ${category}</h4>`;

      controlsHTMLList += `<nav class="nav-list" category="${category}">`;
      for (const snippet in snippetsInCategory) {
        const snippetObj = snippetsInCategory[snippet];

        let tags = "";
        if (snippetObj.tags !== undefined) {
          tags = snippetObj.tags.join(", ");

          tags = ` -> tags: ${tags}`;
        }

        let playButtons = "";
        playButtons += `<span class="paste-icon" tooltip-text="Paste" key="${snippetObj.prefix}">${svgAddSnippetIcon}</span>`;

        controlsHTMLList += `
          <div class="nav-list__item searchables" searchables="${snippetObj.prefix}: ${snippetObj.description}${tags}">
            <div class="nav-list__item has-tooltip list__item_not_clickable" 
                  data-vscode-context='{"key": "${snippetObj.prefix}"}'
                aria-label="${snippetObj.prefix}: ${snippetObj.description}" key="${snippetObj.prefix}"
                tooltip-text="${snippetObj.prefix}: ${snippetObj.description}">
              <div class="nav-list__link list__item_not_clickable" 
                  aria-label="${snippetObj.prefix}: ${snippetObj.description}" key="${snippetObj.prefix}"
                  tooltip-text="${snippetObj.prefix}: ${snippetObj.description}">
                <code-icon class="nav-list__icon" modifier="">
                </code-icon>
                <tooltip class="nav-list__label" content="${snippetObj.prefix}" >
                  <span>${snippetObj.description}</span>
                </tooltip>
              </div>${playButtons}
            </div>
          </div>`;
      }
      controlsHTMLList += "</nav>";
    }

    if (this._snippetsList === undefined) {
      controlsHTMLList = `<br />No Playwright scripts found in package.json.<br />
         Please add some scripts and hit refresh button.`;
    }

    const searchInputHtml = `
      <input type="text" id="searchInput" class="search" placeholder="Search snippets..." />
    `;

    const nonce = getNonce();

    return `<!DOCTYPE html>
      <html lang="en">
              <head>
                  <meta charset="UTF-8">
                  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
  
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
                  <link href="${styleVSCodeUri}" rel="stylesheet">
                  <link href="${styleMainUri}" rel="stylesheet">
  
              </head>
              <body data-vscode-context='{"preventDefaultContextMenuItems": true}'>
                 Just click on the snippet to insert it in the editor:<br />
                 
                  ${searchInputHtml}
                  <span id="msg_placeholder"></span>
                 ${controlsHTMLList}

                  <script nonce="${nonce}" src="${scriptUri}"></script>
              </body>
    </html>`;
  }
}
