import type { CSSProperties } from "react";

export interface ThemeTokens {
  background?: string;
  foreground?: string;
  muted?: string;
  border?: string;
  accent?: string;
  fontFamily?: string;
}

export interface CardStyleProps {
  className?: string;
  style?: CSSProperties;
  theme?: ThemeTokens;
}
