declare module 'leo-profanity' {
  export function clean(text: string): string;
  export function check(text: string): boolean;
  export function add(words: string[]): void;
}
