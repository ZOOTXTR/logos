export interface DefinitionItem {
  partOfSpeech?: string;
  definition: string;
  example?: string;
}

export async function fetchDefinition(word: string, lang: string): Promise<DefinitionItem[]> {
  const cleanWord = word.trim();

  if (lang === 'tr') {
    const url = `https://sozluk.gov.tr/gts?ara=${encodeURIComponent(cleanWord.toLocaleLowerCase('tr-TR'))}`;
    const response = await fetch(url);
    const data = await response.json();

    if (Array.isArray(data) && data.length > 0 && data[0].anlamlarListe) {
      return data[0].anlamlarListe.map((item: any) => ({
        definition: item.anlam,
        partOfSpeech: item.ozelliklerListe?.[0]?.tam_adi || 'isim',
      }));
    }
    throw new Error('Kelime anlamı TDK sözlüğünde bulunamadı.');
  }

  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord.toLowerCase())}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Word not found');
  }

  const data = await response.json();
  const list: DefinitionItem[] = [];

  if (Array.isArray(data) && data[0]?.meanings) {
    data[0].meanings.forEach((meaning: any) => {
      meaning.definitions.forEach((def: any) => {
        list.push({
          partOfSpeech: meaning.partOfSpeech,
          definition: def.definition,
          example: def.example,
        });
      });
    });
    return list.slice(0, 5);
  }

  throw new Error('Definition not found in English dictionary.');
}
