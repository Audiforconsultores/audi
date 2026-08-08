import * as fs from 'fs';
import * as path from 'path';

function searchDir(dir: string) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        searchDir(fullPath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (line.toLowerCase().includes('30') || line.toLowerCase().includes('segundo') || line.toLowerCase().includes('timer') || line.toLowerCase().includes('interval')) {
          console.log(`${file}:${idx + 1} - ${line.trim()}`);
        }
      });
    }
  });
}

searchDir('d:\\Projetos\\Audiforsite\\audi');
