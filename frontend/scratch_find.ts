import * as fs from 'fs';

const content = fs.readFileSync('d:\\Projetos\\Audiforsite\\audi\\frontend\\components\\AccountantArea.tsx', 'utf-8');
const lines = content.split('\n');

lines.forEach((line, index) => {
  if (line.includes('LATITUDE_ESCRITORIO') || line.includes('RAIO_PERMITIDO_METROS')) {
    console.log(`Line ${index + 1}: ${line}`);
  }
});
