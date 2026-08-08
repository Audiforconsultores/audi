import * as fs from 'fs';

const content = fs.readFileSync('d:\\Projetos\\Audiforsite\\audi\\frontend\\components\\AdminArea.tsx', 'utf-8');
const lines = content.split('\n');

lines.forEach((line, index) => {
  if (line.toLowerCase().includes('timer') || line.toLowerCase().includes('30')) {
    console.log(`Line ${index + 1}: ${line}`);
  }
});
