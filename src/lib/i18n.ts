export function rawHtml(value: unknown): { __html: string } {
  return { __html: value as string };
}
