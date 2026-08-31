const fs = require('fs');
const path = require('path');

const files = [
  "app/anagram.tsx",
  "app/blitz.tsx",
  "app/chain.tsx",
  "app/dordle.tsx",
  "app/duel.tsx",
  "app/onboarding.tsx",
  "app/wordconnect.tsx",
  "app/(tabs)/index.tsx",
  "app/(tabs)/leaderboard.tsx",
  "app/(tabs)/modes.tsx",
  "app/(tabs)/profile.tsx",
  "app/(tabs)/settings.tsx"
];

for (const file of files) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if SafeAreaView is already imported from context
  if (content.includes("from 'react-native-safe-area-context'")) {
    continue;
  }
  
  // Find the react-native import line/block
  const rnMatch = content.match(/import\s+{([^}]*)}\s+from\s+['"]react-native['"];/);
  if (rnMatch) {
    let imports = rnMatch[1];
    if (imports.includes('SafeAreaView')) {
      // Remove SafeAreaView
      imports = imports.replace(/\bSafeAreaView\b,?\s*/g, '');
      content = content.replace(rnMatch[0], `import { ${imports.trim()} } from 'react-native';`);
      
      // Add the new import right after it
      content = content.replace(/import {.*?from 'react-native';/, match => `${match}\nimport { SafeAreaView } from 'react-native-safe-area-context';`);
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${file}`);
    }
  }
}
console.log("Done");
