export function toLocaleUpper(str: string): string {
  if (!str) return str;
  return str.replace(/i/g, 'İ').replace(/ı/g, 'I').toUpperCase();
}

export function toLocaleLower(str: string): string {
  if (!str) return str;
  return str.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();
}
