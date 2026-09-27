/**
 * Turkish-safe case conversion utilities.
 * Standard JS toUpperCase()/toLowerCase() corrupts Turkish dotted/dotless I characters.
 * Use these helpers everywhere in the app instead of native methods.
 */

export const toTurkishUpper = (s: string): string =>
  s.replace(/i/g, 'İ').replace(/ı/g, 'I').toUpperCase();

export const toTurkishLower = (s: string): string =>
  s.replace(/I/g, 'ı').replace(/İ/g, 'i').toLocaleLowerCase('tr-TR');
