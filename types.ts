export enum ToolType {
  FUTO_FUDE = 'FUTO_FUDE', // Thick Brush
  HOSO_FUDE = 'HOSO_FUDE', // Thin Brush
  STAMP = 'STAMP',         // Tenkoku/Hanko
}

export interface Point {
  x: number;
  y: number;
  width: number;
  time: number;
}

export interface AppSettings {
  stampText: string;
  artistName: string;
  isAuthenticated: boolean;
}

export interface PostMetadata {
  title: string;
  artist: string;
}