const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../../');
const dictPath = path.join(rootDir, 'constants/validation_dictionary.ts');

const content = fs.readFileSync(dictPath, 'utf8');

// Parse all words from validation_dictionary.ts
const matches = content.match(/'([A-ZÇĞİÖŞÜ]+)'/g);
const words = matches ? matches.map(m => m.replace(/'/g, '')) : [];

console.log('Total words in validation dictionary:', words.length);

const hateAndSlurs = [
  'NIGGER', 'NIGGA', 'FAGGOT', 'DYKE', 'SPIC', 'CHINK', 'KAFIR', 'NAZI', 'HITLER', 'FASCIST', 'KKK', 'JIHAD', 'TERROR', 'HOLOCAUST'
];

const profanityAndVulgarity = [
  'FUCK', 'FUCKS', 'FUCKER', 'FUCKING', 'SHIT', 'SHITS', 'BITCH', 'CUNT', 'CUNTS', 'DICK', 'DICKS', 'COCK', 'COCKS',
  'SLUT', 'SLUTS', 'WHORE', 'WHORES', 'PENIS', 'VAGINA', 'ANUS', 'PUSSY', 'TITS', 'TITTY', 'BOOB', 'BOOBS', 'CLIT',
  'OROSPU', 'PIC', 'PIÇ', 'PİÇ', 'IBNE', 'İBNE', 'GOT', 'GÖT', 'GÖTLER', 'YARRAK', 'TASSAK', 'TAŞŞAK', 'AMCIK', 'KAHPE',
  'FAHISE', 'FAHİŞE', 'PEZEVENK', 'SIK', 'SIKMEK', 'SIKTIR', 'SİKTİR', 'SIKEYIM', 'SİKEYİM', 'AMINA', 'MEME', 'MEMELER'
];

const violenceAndIllegal = [
  'RAPE', 'RAPIST', 'RAPED', 'KILL', 'MURDER', 'SUICIDE', 'COCAINE', 'HEROIN', 'WEED', 'ESRAR', 'EROIN', 'EROİN', 'KOKAİN'
];

function findInDict(list, category) {
  const found = [];
  list.forEach(w => {
    if (words.includes(w)) {
      found.push(w);
    }
  });
  console.log(`[${category}] Found ${found.length} matches:`, found);
}

findInDict(hateAndSlurs, 'Hate Speech & Slurs');
findInDict(profanityAndVulgarity, 'Profanity & Explicit Content');
findInDict(violenceAndIllegal, 'Violence, Drugs & Illegal Content');
