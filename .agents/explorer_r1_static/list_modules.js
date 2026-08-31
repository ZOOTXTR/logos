const fs = require('fs');
const path = require('path');

const rootDir = 'C:/Users/mhmto/.gemini/antigravity/scratch/gemquest52';

const services = fs.readdirSync(path.join(rootDir, 'services')).filter(f => f.endsWith('.ts'));
const hooks = fs.readdirSync(path.join(rootDir, 'hooks')).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
const store = fs.readdirSync(path.join(rootDir, 'store')).filter(f => f.endsWith('.ts'));
const app = fs.readdirSync(path.join(rootDir, 'app')).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
const appTabs = fs.readdirSync(path.join(rootDir, 'app/(tabs)')).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));

console.log('Services:', services);
console.log('Hooks:', hooks);
console.log('Store:', store);
console.log('App root:', app);
console.log('App tabs:', appTabs);
