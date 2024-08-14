export interface PwSnippet {
  prefix: string;
  body: string[];
  description: string;
  prettyName?: string;
  category?: string;
}

export interface PwSnippetMap {
  [key: string]: PwSnippet;
}
