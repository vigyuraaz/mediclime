import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const distIndexPath = path.join(rootDir, 'dist', 'index.html');
const apiDir = path.join(rootDir, 'api');
const templateOutputPath = path.join(apiDir, '_template.js');

try {
  if (fs.existsSync(distIndexPath)) {
    const html = fs.readFileSync(distIndexPath, 'utf8');
    if (!fs.existsSync(apiDir)) {
      fs.mkdirSync(apiDir, { recursive: true });
    }
    const content = `// Auto-generated production HTML template bundle for dynamic SSR injection\nexport const htmlTemplate = ${JSON.stringify(html)};\n`;
    fs.writeFileSync(templateOutputPath, content, 'utf8');
    console.log('[sync-template] Successfully generated api/_template.js from dist/index.html');
  } else {
    console.warn('[sync-template] Warning: dist/index.html not found, skipping template sync');
  }
} catch (err) {
  console.error('[sync-template] Error syncing template:', err);
}
