declare global {
  interface Window {
    clarity?: (method: string, ...args: unknown[]) => void;
  }
}

export {};
