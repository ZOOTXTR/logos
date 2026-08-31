const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../../');
const dictPath = path.join(rootDir, 'constants/validation_dictionary.ts');
const wordsTrPath = path.join(rootDir, 'constants/words.ts');
const wordsEnPath = path.join(rootDir, 'constants/words_en.ts');

const profanityList = [
  'SIK', 'SIKTIR', 'SİKTİR', 'AMCIK', 'OROSPU', 'PIC', 'PIÇ', 'PİÇ', 'YARRAK', 'YARRA', 'GOT', 'GÖT', 'TASSAK', 'TAŞŞAK', 'IBNE', 'İBNE', 'PEZEVENK', 'KAHPE', 'FAHISE', 'FAHİŞE', 'PORNO', 'SEKS', 'SEX', 'AMINA', 'SIKEYIM', 'SİKEYİM', 'MEME', 'KASAR', 'KAŞAR', 'KAHPE', 'DOMUZ',
  'FUCK', 'SHIT', 'BITCH', 'CUNT', 'DICK', 'PISS', 'COCK', 'BASTARD', 'SLUT', 'WHORE', 'PENIS', 'VAGINA', 'NIGGER', 'NIGGA', 'FAGGOT', 'NAZI', 'HITLER', 'RAPE', 'RAPIST', 'ANUS', 'ASS', 'BALLS', 'TITS', 'TIT', 'BOOBS', 'PUSSY'
];

function checkFile(filePath, label) {
  if (!fs.existsSync(filePath)) {
    console.log(`[${label}] File not found: ${filePath}`);
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  console.log(`[${label}] Checking file: ${filePath} (${content.length} bytes)`);
  
  const found = [];
  profanityList.forEach(word => {
    // Regex matching exact string in array: 'WORD' or "WORD"
    const regex = new RegExp(`['"]` + word + `['"]`, 'i');
    if (regex.test(content)) {
      found.push(word);
    }
  });

  console.log(`[${label}] Found ${found.length} matches:`, found);
}

checkFile(wordsTrPath, 'TR Word Bank');
checkFile(wordsEnPath, 'EN Word Bank');
checkFile(dictPath, 'Validation Dictionary');
