const fs = require('fs');
const content = fs.readFileSync('c:/Users/arman/OneDrive/Documents/Kemplang aleng/apps/api/dist/index.js', 'utf8');

const lines = content.split('\n');
console.log('Total lines:', lines.length);

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('better-auth') || lines[i].includes('.mjs') || lines[i].includes('toNodeHandler')) {
    console.log(`Line ${i + 1}: ${lines[i].trim()}`);
  }
}
