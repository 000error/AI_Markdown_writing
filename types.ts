
export interface Variant {
  id: string;
  title: string;
  prompt: string;
  content: string;
  customCss: string;
  isGenerating: boolean;
  isExpanded: boolean;
}

export interface AppState {
  baseContent: string;
  baseCss: string;
  variants: Variant[];
  activeId: string;
}
