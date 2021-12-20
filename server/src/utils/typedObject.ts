export function fromEntries<T>(entries: [keyof T, T[keyof T]][]): T {
  return entries.reduce((acc, [key, value]) => ({ ...acc, [key]: value }), <T>{});
}
