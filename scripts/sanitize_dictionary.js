// sanitize_dictionary.js — Remove offensive/hate-speech words from validation_dictionary.ts
const fs = require('fs');
const path = require('path');

const dictPath = path.join(__dirname, '..', 'constants', 'validation_dictionary.ts');
let content = fs.readFileSync(dictPath, 'utf-8');

// Comprehensive blocklist: hate speech, slurs, explicit sexual terms, illegal drugs, extremism
const BLOCKLIST = new Set([
  // English racial/homophobic slurs
  'NIGGER', 'NIGGERS', 'NIGGA', 'NIGGAS', 'FAGGOT', 'FAGGOTS', 'FAG', 'FAGS',
  'DYKE', 'DYKES', 'SPIC', 'SPICS', 'CHINK', 'CHINKS', 'KIKE', 'KIKES',
  'GOOK', 'GOOKS', 'WETBACK', 'COON', 'COONS', 'DARKIE', 'DARKIES',
  'BEANER', 'BEANERS', 'HONKY', 'HONKEY', 'TRANNY', 'TRANNIES',
  // English explicit profanity
  'FUCK', 'FUCKER', 'FUCKED', 'FUCKS', 'FUCKING', 'MOTHERFUCKER',
  'CUNT', 'CUNTS', 'BITCH', 'BITCHES', 'WHORE', 'WHORES',
  'SLUT', 'SLUTS', 'DICK', 'DICKS', 'COCK', 'COCKS',
  'PUSSY', 'PUSSIES', 'ASSHOLE', 'ASSHOLES', 'BASTARD', 'BASTARDS',
  'SHIT', 'SHITS', 'SHITTY', 'BULLSHIT', 'TWAT', 'TWATS',
  'WANKER', 'WANKERS', 'TOSSER', 'BOLLOCKS',
  // English sexual/anatomical (inappropriate for 3+)
  'PENIS', 'PENISES', 'VAGINA', 'VAGINAS', 'CLITORIS', 'DILDO', 'DILDOS',
  'ORGASM', 'ORGASMS', 'ERECTION', 'EJACULATE', 'MASTURBATE',
  'BLOWJOB', 'HANDJOB', 'RIMJOB', 'ANAL', 'ANUS',
  // Sexual violence
  'RAPE', 'RAPED', 'RAPES', 'RAPIST', 'RAPISTS', 'MOLEST', 'MOLESTER',
  'PEDOPHILE', 'PAEDOPHILE',
  // Extremism
  'NAZI', 'NAZIS', 'HITLER', 'JIHAD', 'JIHADIST', 'JIHADISTS',
  'KAFIR', 'KAFIRS', 'GENOCIDE',
  // Drugs (illicit)
  'HEROIN', 'COCAINE', 'METHAMPHETAMINE',
  // Turkish offensive terms
  'OROSPU', 'OROSPULAR', 'IBNE', 'IBNELER',
  'KAHPE', 'KAHPELER', 'FAHISE', 'FAHISELER',
  'GAVAT', 'PEZEVENK', 'PUST', 'GOTVEREN',
  'AMCIK', 'YARRAK', 'SIK', 'SIKIK', 'SIKTIR',
  'PIC', 'KEVASE', 'KASAR', 'SURTUK', 'KALTAK',
  // Turkish with special chars
  'İBNE', 'İBNELER', 'FAHİŞE', 'FAHİŞELER', 'PUŞT',
  'AMCIK', 'PİÇ', 'KEVAŞE', 'KAŞAR', 'SÜRTÜK',
  // Turkish drugs
  'EROİN', 'KOKAİN', 'ESRAR', 'METAMFETAMİN',
  // Turkish extremism
  'KAFİR', 'KAFİRLER', 'CİHAT', 'CİHATÇI',
]);

let removedCount = 0;

for (const word of BLOCKLIST) {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`\\s*'${escaped}',?\\r?\\n`, 'g');
  const before = content.length;
  content = content.replace(pattern, '\n');
  if (content.length !== before) {
    removedCount++;
    console.log(`  Removed: ${word}`);
  }
}

fs.writeFileSync(dictPath, content, 'utf-8');
console.log(`\nDone! Removed ${removedCount} offensive entries from validation_dictionary.ts`);
