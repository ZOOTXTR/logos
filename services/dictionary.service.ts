let trDict: Set<string> | null = null;
let enDict: Set<string> | null = null;
let loadPromise: Promise<void> | null = null;

export async function preloadDictionaries(): Promise<void> {
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    const m = await import('../constants/validation_dictionary');
    trDict = m.VALIDATION_DICT_TR;
    enDict = m.VALIDATION_DICT_EN;
  })();
  return loadPromise;
}

export function getDictionary(lang: 'tr' | 'en'): Set<string> | null {
  return lang === 'en' ? enDict : trDict;
}

export function isDictionaryReady(): boolean {
  return trDict !== null && enDict !== null;
}
