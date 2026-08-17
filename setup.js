// Setup script: copies CSV files from dashboard_data/ to public/data/
// Run with: node setup.js
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const srcDir = join(__dirname, 'dashboard_data');
const destDir = join(__dirname, 'public', 'data');

if (!existsSync(destDir)) {
  mkdirSync(destDir, { recursive: true });
}

const files = [
  'dashboard_kpis.csv',
  'dashboard_customer_status.csv',
  'dashboard_customer_data.csv',
  'dashboard_duplicate_pairs.csv',
  'dashboard_education.csv',
  'dashboard_gender.csv',
  'dashboard_language.csv',
  'dashboard_location.csv',
  'dashboard_occupation.csv',
  'dashboard_policy.csv',
  'dashboard_similarity.csv'
];

files.forEach(file => {
  const src = join(srcDir, file);
  const dest = join(destDir, file);
  try {
    copyFileSync(src, dest);
    console.log(`✓ Copied: ${file}`);
  } catch (err) {
    console.error(`✗ Error copying ${file}:`, err.message);
  }
});

console.log('\n✅ Setup complete! Run: npm install && npm run dev');
