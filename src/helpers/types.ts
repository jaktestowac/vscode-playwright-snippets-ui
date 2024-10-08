export interface PwSnippet {
  prefix: string;
  body: string[];
  description: string;
  prettyName?: string;
  category?: string;
  tags?: string[];
}

export interface PwSnippetMap {
  [key: string]: PwSnippet;
}

export interface PwSnippetListMap {
  [key: string]: PwSnippet[];
}
