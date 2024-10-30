import { PwSnippet } from "./types";

export function getNonce(): string {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export function formatSnippet(snippet: PwSnippet): string {
  let snippetString = "";
  snippetString += `// ${snippet.description}\n`;
  snippetString += `${snippet.body.join("\n")}\n`;
  return snippetString;
}
